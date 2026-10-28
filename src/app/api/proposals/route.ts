import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { created, fail, forbidden, unauthorized, handle } from '@/lib/api';
import { createProposalSchema } from '@/lib/validations/proposal';
import { notifyUser } from '@/lib/notify';

/**
 * POST /api/proposals — a freelancer submits a proposal to an open job.
 * Enforces: role, one-active-proposal-per-job (DB unique + friendly check),
 * and computes a lightweight anti-spam quality score.
 */
export function POST(req: Request) {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();
    if (!['FREELANCER', 'AGENCY_OWNER', 'AGENCY_MEMBER'].includes(session.user.role)) {
      return forbidden();
    }

    // Anti-spam gates: confirmed email + admin approval before applying.
    const me = await db.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true, approvedAt: true },
    });
    if (!me?.emailVerified) return forbidden('请先验证邮箱后再投标（请查看收件箱）');
    if (!me.approvedAt) return forbidden('账号正在等待管理员审核，通过后即可投标');

    const body = createProposalSchema.parse(await req.json());

    const job = await db.job.findUnique({
      where: { id: body.jobId },
      select: { id: true, slug: true, status: true, clientId: true, title: true },
    });
    if (!job || job.status !== 'OPEN') return fail('该需求已停止接收投标', 409);
    if (job.clientId === session.user.id) return fail('不能对自己的需求投标', 400);

    const duplicate = await db.proposal.findUnique({
      where: { jobId_freelancerId: { jobId: job.id, freelancerId: session.user.id } },
    });
    if (duplicate) return fail('你已提交过该需求的投标', 409);

    const qualityScore = await computeQualityScore(session.user.id, body.coverLetter);

    const proposal = await db.proposal.create({
      data: {
        jobId: job.id,
        freelancerId: session.user.id,
        coverLetter: body.coverLetter,
        bidAmount: body.bidAmount,
        bidType: body.bidType,
        estimatedDays: body.estimatedDays,
        qualityScore,
        milestones: {
          create: body.milestones.map((m, i) => ({
            title: m.title,
            amount: m.amount,
            dueInDays: m.dueInDays,
            order: i,
          })),
        },
      },
      select: { id: true, qualityScore: true },
    });

    // Notify the client (in-app; email fan-out handled by the notification
    // worker). `body` carries the applicant's display name so the outbound email
    // — including the account-less recruiter one — can name who applied.
    const applicant = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });
    await notifyUser({
      userId: job.clientId,
      type: 'PROPOSAL_RECEIVED',
      title: `New applicant for "${job.title}"`,
      body: applicant?.name ?? 'A freelancer',
      href: `/jobs/${job.slug}/proposals`,
    });

    return created(proposal);
  });
}

/**
 * A deliberately simple, transparent quality score (0-100). Real ranking can
 * grow into a proper model later, but transparency is a core value: the inputs
 * are just profile completeness, cover-letter effort, and account age.
 */
async function computeQualityScore(userId: string, coverLetter: string): Promise<number> {
  const profile = await db.freelancerProfile.findUnique({
    where: { userId },
    select: { completenessScore: true },
  });
  const completeness = profile?.completenessScore ?? 0; // 0-100
  const effort = Math.min(coverLetter.trim().length / 600, 1) * 100; // caps at ~600 chars
  return Math.round(completeness * 0.6 + effort * 0.4);
}
