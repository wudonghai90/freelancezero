import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { created, fail, forbidden, unauthorized, handle } from '@/lib/api';
import { notifyUser } from '@/lib/notify';

const schema = z.object({
  type: z.enum(['NORMAL', 'VAT_SPECIAL']).default('NORMAL'),
  title: z.string().trim().max(100).optional(),
  taxNumber: z.string().trim().max(40).optional(),
  email: z.string().trim().email().optional(),
});

/**
 * POST /api/contracts/:id/invoice — 委托方按已结算金额申请发票。
 * 实际开票仍由服务方线下完成，这里只记录申请与抬头信息。
 */
export function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();

    const { id } = await params;
    const body = schema.parse(await req.json().catch(() => ({})));

    const contract = await db.contract.findUnique({
      where: { id },
      select: {
        id: true,
        clientId: true,
        freelancerId: true,
        title: true,
        currency: true,
        milestones: { where: { status: 'RELEASED' }, select: { amount: true } },
      },
    });
    if (!contract) return fail('合同不存在', 404);
    if (contract.clientId !== session.user.id) return forbidden('只有委托方可以申请发票');

    const amount = contract.milestones.reduce((sum, m) => sum + m.amount, 0);
    if (amount <= 0) return fail('暂无可开票的已结算金额', 409);

    const profile = await db.invoiceProfile.findUnique({
      where: { userId: session.user.id },
    });

    const title = body.title || profile?.title;
    if (!title) return fail('请先填写发票抬头', 422);

    const invoice = await db.invoice.create({
      data: {
        contractId: contract.id,
        applicantId: session.user.id,
        amount,
        currency: contract.currency,
        type: body.type,
        title,
        taxNumber: body.taxNumber || profile?.taxNumber || null,
        email: body.email || profile?.email || null,
      },
      select: { id: true },
    });

    await notifyUser({
      userId: contract.freelancerId,
      type: 'SYSTEM',
      title: `收到开票申请：${contract.title}`,
      body: `抬头：${title}，金额以已结算里程碑为准。`,
      href: `/contracts/${contract.id}`,
    });

    return created({ id: invoice.id });
  });
}
