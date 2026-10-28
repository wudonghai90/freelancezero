import { headers } from 'next/headers';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ok, fail, forbidden, unauthorized, handle } from '@/lib/api';
import { getEsignAdapter } from '@/lib/adapters/esign';
import { notifyUser } from '@/lib/notify';

const schema = z.object({ agree: z.literal(true) });

/** POST /api/contracts/:id/sign — 以当前账号的实名信息签署合同。 */
export function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();

    const { id } = await params;
    schema.parse(await req.json());

    const contract = await db.contract.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        clientId: true,
        freelancerId: true,
        clientSignedAt: true,
        freelancerSignedAt: true,
        signatures: {
          select: { userId: true, party: true, status: true },
        },
      },
    });
    if (!contract) return fail('合同不存在', 404);

    const isClient = contract.clientId === session.user.id;
    const isFreelancer = contract.freelancerId === session.user.id;
    if (!isClient && !isFreelancer) return forbidden('你不是本合同当事人');
    if (contract.status !== 'ACTIVE') return fail('合同当前状态不可签署', 409);

    const me = await db.user.findUnique({
      where: { id: session.user.id },
      select: { realName: true, identityStatus: true },
    });
    if (me?.identityStatus !== 'VERIFIED' || !me.realName) {
      return fail('请先完成实名认证再签署合同', 403);
    }

    const mine = contract.signatures.find((s) => s.userId === session.user.id);
    if (!mine) return fail('缺少签署记录', 409);
    if (mine.status === 'SIGNED') return fail('你已签署本合同', 409);

    const adapter = getEsignAdapter();
    if (!adapter.configured) return fail('电子签服务未配置', 503);

    const h = await headers();
    const result = await adapter.sign({
      contractId: contract.id,
      userId: session.user.id,
      party: mine.party,
      signerName: me.realName,
      ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
      userAgent: h.get('user-agent') ?? undefined,
    });

    const now = new Date();
    const signed = result.status === 'SIGNED';

    const updated = await db.$transaction(async (tx) => {
      await tx.contractSignature.update({
        where: { contractId_userId: { contractId: contract.id, userId: session.user.id } },
        data: {
          status: result.status,
          signerName: me.realName,
          provider: result.provider,
          providerRef: result.ref ?? null,
          ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
          userAgent: h.get('user-agent') ?? null,
          signedAt: signed ? now : null,
        },
      });

      return tx.contract.update({
        where: { id: contract.id },
        data: isClient
          ? { clientSignedAt: signed ? now : null }
          : { freelancerSignedAt: signed ? now : null },
        select: { clientSignedAt: true, freelancerSignedAt: true },
      });
    });

    const bothSigned = !!updated.clientSignedAt && !!updated.freelancerSignedAt;

    if (signed) {
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'contract.sign',
          entity: 'Contract',
          entityId: contract.id,
        },
      });

      await notifyUser({
        userId: isClient ? contract.freelancerId : contract.clientId,
        type: 'SYSTEM',
        title: bothSigned ? '合同已双方签署' : '对方已签署合同',
        body: bothSigned ? '合同已生效，可以开始按里程碑推进。' : '请查看合同并完成签署。',
        href: `/contracts/${contract.id}`,
      });
    }

    return ok({ signed, bothSigned });
  });
}
