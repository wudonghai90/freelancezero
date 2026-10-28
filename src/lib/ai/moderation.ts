import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { approveAccount } from '@/lib/approvals';

const TIMEOUT_MS = 15_000;
const FREELANCER_ROLES = ['FREELANCER', 'AGENCY_OWNER', 'AGENCY_MEMBER'];

type Verdict = {
  decision?: unknown;
  risk?: unknown;
  reason?: unknown;
};

function short(value: string | null | undefined, max = 500): string | null {
  if (!value?.trim()) return null;
  return value.trim().slice(0, max);
}

/**
 * LLM pre-screen for a newly registered account. It never rejects anyone:
 * a clear pass auto-approves, anything else (flag, bad response, network
 * error) leaves the account in the human approval queue.
 */
export async function runAutoReview(userId: string): Promise<void> {
  const apiKey = env.AI_MODERATION_API_KEY;
  if (!apiKey) return;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      realName: true,
      role: true,
      status: true,
      emailVerified: true,
      approvedAt: true,
      autoReviewStatus: true,
      updatedAt: true,
      freelancerProfile: {
        select: { headline: true, bio: true, location: true },
      },
      clientProfile: {
        select: { companyName: true, about: true, location: true },
      },
    },
  });

  if (!user) return;
  if (user.approvedAt || user.role === 'ADMIN' || user.status === 'UNCLAIMED') return;
  if (!user.emailVerified) return;
  if (!short(user.name, 120)) return;
  if (user.autoReviewStatus === 'PASSED') return;
  // A PENDING row older than 10 minutes means a previous call died mid-flight.
  const stuck = user.autoReviewStatus === 'PENDING' && Date.now() - user.updatedAt.getTime() > 10 * 60_000;
  if (user.autoReviewStatus === 'PENDING' && !stuck) return;

  const isFreelancer = FREELANCER_ROLES.includes(user.role);
  const fp = user.freelancerProfile;
  const cp = user.clientProfile;
  // Freelancers must have the fields the review is about; otherwise wait for
  // the next profile save instead of approving an empty profile.
  if (isFreelancer && (!short(fp?.headline) || !short(fp?.location))) return;

  const payload = {
    role: user.role,
    name: short(user.realName, 60) ?? short(user.name, 60),
    headline: short(fp?.headline),
    bio: short(isFreelancer ? fp?.bio : cp?.about, 1500),
    location: short(isFreelancer ? fp?.location : cp?.location),
    companyName: short(cp?.companyName, 120),
  };

  await db.user.update({
    where: { id: userId },
    data: { autoReviewStatus: 'PENDING' },
  });

  try {
    const res = await fetch(`${env.AI_MODERATION_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        model: env.AI_MODERATION_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: [
              '你是自由工作平台的注册资料初筛助手。',
              '只判断明显的虚假、违规或滥用风险，不做法律结论，不因资料简单而拒绝。',
              '重点检查：姓名是否像正常姓名（无广告、网址、联系方式、辱骂）；',
              '标题/简介是否是正常职业描述（无联系方式、引流、违法服务、色情、赌博、诈骗）；',
              '所在地是否是可识别的真实地区；公司名是否正常且无仿冒知名品牌或广告。',
              '信息不足或不确定时必须选择 review。',
              '只返回 JSON：{"decision":"approve"或"review","risk":0-100的整数,"reason":"简短中文理由"}',
            ].join('\n'),
          },
          { role: 'user', content: JSON.stringify(payload) },
        ],
      }),
    });

    if (!res.ok) throw new Error(`AI moderation HTTP ${res.status}`);

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error('AI moderation returned no content');

    const verdict = JSON.parse(content) as Verdict;
    const risk = typeof verdict.risk === 'number' ? Math.max(0, Math.min(100, Math.round(verdict.risk))) : 100;
    const reason = short(typeof verdict.reason === 'string' ? verdict.reason : null, 500);

    if (verdict.decision === 'approve' && risk <= 40) {
      await db.user.update({
        where: { id: userId },
        data: { autoReviewScore: risk, autoReviewReason: reason, autoReviewedAt: new Date() },
      });
      await approveAccount(userId, { source: 'ai' });
      return;
    }

    await db.user.update({
      where: { id: userId },
      data: {
        autoReviewStatus: 'FLAGGED',
        autoReviewScore: risk,
        autoReviewReason: reason ?? 'AI 建议人工复核',
        autoReviewedAt: new Date(),
      },
    });
    await db.auditLog.create({
      data: {
        userId,
        action: 'ai.review_flagged',
        entity: 'User',
        entityId: userId,
        metadata: { risk, reason },
      },
    });
  } catch (err) {
    console.error('[ai-moderation] review failed', userId, err);
    await db.user.update({
      where: { id: userId },
      data: {
        autoReviewStatus: 'FAILED',
        autoReviewReason: 'AI 审核暂时不可用，已转人工审核',
        autoReviewedAt: new Date(),
      },
    });
  }
}
