import type { PaymentProvider } from '@prisma/client';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ok, fail, forbidden, unauthorized, handle } from '@/lib/api';
import { getPaymentsAdapter } from '@/lib/adapters/payments';
import { formatMoney } from '@/lib/utils';

const schema = z.object({
  action: z.enum(['FUND', 'SUBMIT', 'APPROVE', 'RELEASE']),
});

function toProvider(provider: string): PaymentProvider {
  if (provider === 'ALIPAY') return 'ALIPAY';
  if (provider === 'WECHAT_PAY') return 'WECHAT_PAY';
  return 'MANUAL';
}

/**
 * POST /api/contracts/:id/milestones/:milestoneId — 里程碑状态机：
 * PENDING → FUNDED（客户托管）→ SUBMITTED（乙方交付）→ APPROVED（甲方验收）
 * → RELEASED（放款）。资金动作全部走支付适配器，manual 模式只记账。
 */
export function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; milestoneId: string }> },
) {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();

    const { id, milestoneId } = await params;
    const { action } = schema.parse(await req.json());

    const milestone = await db.milestone.findFirst({
      where: { id: milestoneId, contractId: id },
      select: {
        id: true,
        title: true,
        amount: true,
        status: true,
        contract: {
          select: {
            id: true,
            jobId: true,
            currency: true,
            clientId: true,
            freelancerId: true,
            clientSignedAt: true,
            freelancerSignedAt: true,
          },
        },
      },
    });
    if (!milestone) return fail('里程碑不存在', 404);

    const { contract } = milestone;
    const isClient = contract.clientId === session.user.id;
    const isFreelancer = contract.freelancerId === session.user.id;
    if (!isClient && !isFreelancer) return forbidden('你不是本合同当事人');

    const amount = formatMoney(milestone.amount, contract.currency, 'zh-CN');
    const href = `/contracts/${contract.id}`;

    if (action === 'FUND') {
      if (!isClient) return forbidden('只有委托方可以托管资金');
      if (!contract.clientSignedAt || !contract.freelancerSignedAt) {
        return fail('双方签署后才能托管资金', 409);
      }
      if (milestone.status !== 'PENDING') return fail('该里程碑已托管或已结束', 409);

      const result = await getPaymentsAdapter().fundMilestone({
        milestoneId: milestone.id,
        amount: milestone.amount,
        currency: contract.currency,
        clientId: contract.clientId,
        freelancerId: contract.freelancerId,
      });
      const now = new Date();

      await db.$transaction(async (tx) => {
        await tx.payment.create({
          data: {
            milestoneId: milestone.id,
            provider: toProvider(result.provider),
            status: 'ESCROW_FUNDED',
            amount: milestone.amount,
            currency: contract.currency,
            providerRef: result.providerRef ?? null,
            outTradeNo: `MK${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          },
        });
        await tx.milestone.update({
          where: { id: milestone.id },
          data: { status: 'FUNDED' },
        });
        await tx.auditLog.create({
          data: {
            userId: session.user.id,
            action: 'milestone.fund',
            entity: 'Milestone',
            entityId: milestone.id,
          },
        });
        await tx.notification.create({
          data: {
            userId: contract.freelancerId,
            type: 'MILESTONE_FUNDED',
            title: `里程碑已托管：${milestone.title}`,
            body: `${amount} 已托管，可以开始交付。`,
            href,
          },
        });
      });

      return ok({ status: 'FUNDED' });
    }

    if (action === 'SUBMIT') {
      if (!isFreelancer) return forbidden('只有服务方可以提交交付');
      if (milestone.status !== 'FUNDED') return fail('资金托管后才能提交交付', 409);

      await db.$transaction([
        db.milestone.update({ where: { id: milestone.id }, data: { status: 'SUBMITTED' } }),
        db.notification.create({
          data: {
            userId: contract.clientId,
            type: 'SYSTEM',
            title: `里程碑待验收：${milestone.title}`,
            body: '服务方已提交交付物，请在 5 个工作日内验收。',
            href,
          },
        }),
      ]);
      return ok({ status: 'SUBMITTED' });
    }

    if (action === 'APPROVE') {
      if (!isClient) return forbidden('只有委托方可以验收');
      if (milestone.status !== 'SUBMITTED') return fail('当前状态不可验收', 409);

      await db.$transaction([
        db.milestone.update({ where: { id: milestone.id }, data: { status: 'APPROVED' } }),
        db.notification.create({
          data: {
            userId: contract.freelancerId,
            type: 'SYSTEM',
            title: `里程碑已验收：${milestone.title}`,
            body: '委托方已验收，等待放款。',
            href,
          },
        }),
      ]);
      return ok({ status: 'APPROVED' });
    }

    // RELEASE
    if (!isClient) return forbidden('只有委托方可以放款');
    if (milestone.status !== 'APPROVED') return fail('验收通过后才能放款', 409);

    const result = await getPaymentsAdapter().releaseMilestone(milestone.id);
    const now = new Date();

    const completed = await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { milestoneId: milestone.id },
        data: {
          status: 'RELEASED',
          providerRef: result.providerRef ?? undefined,
          paidAt: now,
        },
      });
      await tx.milestone.update({ where: { id: milestone.id }, data: { status: 'RELEASED' } });
      await tx.notification.create({
        data: {
          userId: contract.freelancerId,
          type: 'MILESTONE_RELEASED',
          title: `款项已发放：${milestone.title}`,
          body: `${amount} 已结算。`,
          href,
        },
      });
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'milestone.release',
          entity: 'Milestone',
          entityId: milestone.id,
        },
      });

      const remaining = await tx.milestone.count({
        where: { contractId: contract.id, status: { not: 'RELEASED' } },
      });
      if (remaining === 0) {
        await tx.contract.update({
          where: { id: contract.id },
          data: { status: 'COMPLETED' },
        });
        await tx.job.update({
          where: { id: contract.jobId },
          data: { status: 'CLOSED' },
        });
        return true;
      }
      return false;
    });

    return ok({ status: 'RELEASED', completed });
  });
}
