import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { created, fail, forbidden, unauthorized, handle } from '@/lib/api';
import { buildContractContent } from '@/lib/contracts';
import { notifyUser } from '@/lib/notify';

const schema = z.object({
  proposalId: z.string().cuid(),
});

/** POST /api/contracts — 客户录用某个投标并生成合同（含里程碑与待签署记录）。 */
export function POST(req: Request) {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();

    const { proposalId } = schema.parse(await req.json());

    const proposal = await db.proposal.findUnique({
      where: { id: proposalId },
      select: {
        id: true,
        status: true,
        bidAmount: true,
        bidType: true,
        estimatedDays: true,
        freelancerId: true,
        milestones: { orderBy: { order: 'asc' } },
        freelancer: { select: { name: true, realName: true, email: true } },
        job: {
          select: {
            id: true,
            title: true,
            currency: true,
            clientId: true,
            status: true,
            estimatedDays: true,
            client: {
              select: {
                name: true,
                realName: true,
                email: true,
                clientProfile: { select: { companyName: true } },
              },
            },
          },
        },
      },
    });

    if (!proposal) return fail('投标不存在', 404);
    if (proposal.job.clientId !== session.user.id) return forbidden('只有需求发布方可以录用');
    if (proposal.status === 'REJECTED' || proposal.status === 'WITHDRAWN') {
      return fail('该投标已关闭，无法录用', 409);
    }

    const existing = await db.contract.findUnique({
      where: { jobId: proposal.job.id },
      select: { id: true },
    });
    if (existing) return fail('该需求已生成合同', 409);

    const milestones =
      proposal.milestones.length > 0
        ? proposal.milestones.map((m) => ({
            title: m.title,
            amount: m.amount,
            dueInDays: m.dueInDays,
          }))
        : [{ title: '项目全款', amount: proposal.bidAmount, dueInDays: proposal.estimatedDays }];

    const total = milestones.reduce((sum, m) => sum + m.amount, 0) || proposal.bidAmount;

    const clientLabel =
      proposal.job.client.clientProfile?.companyName?.trim() ||
      proposal.job.client.realName?.trim() ||
      proposal.job.client.name?.trim() ||
      proposal.job.client.email;

    const freelancerLabel =
      proposal.freelancer.realName?.trim() ||
      proposal.freelancer.name?.trim() ||
      proposal.freelancer.email;

    const content = buildContractContent({
      clientLabel,
      freelancerLabel,
      jobTitle: proposal.job.title,
      budgetType: proposal.bidType,
      currency: proposal.job.currency,
      estimatedDays: proposal.estimatedDays ?? proposal.job.estimatedDays,
      total,
      milestones,
    });

    const contract = await db.$transaction(async (tx) => {
      const c = await tx.contract.create({
        data: {
          jobId: proposal.job.id,
          clientId: proposal.job.clientId,
          freelancerId: proposal.freelancerId,
          title: proposal.job.title,
          budgetType: proposal.bidType,
          currency: proposal.job.currency,
          content,
          milestones: {
            create: milestones.map((m, i) => ({
              title: m.title,
              amount: m.amount,
              order: i,
              dueAt: m.dueInDays ? new Date(Date.now() + m.dueInDays * 86400000) : null,
            })),
          },
          signatures: {
            create: [
              { userId: proposal.job.clientId, party: 'CLIENT' },
              { userId: proposal.freelancerId, party: 'FREELANCER' },
            ],
          },
        },
        select: { id: true },
      });

      await tx.proposal.update({ where: { id: proposal.id }, data: { status: 'ACCEPTED' } });
      await tx.proposal.updateMany({
        where: { jobId: proposal.job.id, id: { not: proposal.id } },
        data: { status: 'REJECTED' },
      });
      await tx.job.update({
        where: { id: proposal.job.id },
        data: { status: 'IN_PROGRESS' },
      });
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'contract.create',
          entity: 'Contract',
          entityId: c.id,
        },
      });
      return c;
    });

    await notifyUser({
      userId: proposal.freelancerId,
      type: 'SYSTEM',
      title: `合同已生成：${proposal.job.title}`,
      body: '请查看合同内容并完成签署。',
      href: `/contracts/${contract.id}`,
    });

    return created({ id: contract.id });
  });
}
