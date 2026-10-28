import { db } from '@/lib/db';
import { sendMail } from '@/lib/mail/send';

type ApprovalSource = 'admin' | 'ai';

/**
 * Mark an account approved and send the welcome notification/email.
 * Idempotent: a second call after approval is a no-op.
 */
export async function approveAccount(
  userId: string,
  opts: { source: ApprovalSource; approvedBy?: string },
): Promise<boolean> {
  const user = await db.user.findFirst({
    where: { id: userId, approvedAt: null, deletedAt: null },
    select: { email: true, name: true, role: true },
  });
  if (!user) return false;

  const now = new Date();
  const updated = await db.user.updateMany({
    where: { id: userId, approvedAt: null },
    data: {
      approvedAt: now,
      ...(opts.source === 'ai'
        ? { autoReviewStatus: 'PASSED' as const, autoReviewedAt: now }
        : {}),
    },
  });
  if (updated.count === 0) return false;

  const appliesTo = user.role === 'CLIENT' ? '发布需求' : '投标接单';

  await db.notification.create({
    data: {
      userId,
      type: 'SYSTEM',
      title: '账号审核已通过',
      body: `你现在可以${appliesTo}了，欢迎加入。`,
      href: '/dashboard',
    },
  });

  if (user.email) {
    await sendMail(
      user.email,
      '你的自由工作平台账号已通过审核',
      `你好，${user.name ?? '用户'}：\n\n` +
        `你的账号已通过审核，现在可以${appliesTo}。\n\n` +
        `[进入工作台](${process.env.NEXT_PUBLIC_APP_URL}/dashboard)`,
    );
  }

  await db.auditLog.create({
    data: {
      userId: opts.approvedBy ?? userId,
      action: opts.source === 'ai' ? 'ai.auto_approve' : 'admin.approve',
      entity: 'User',
      entityId: userId,
    },
  });

  return true;
}
