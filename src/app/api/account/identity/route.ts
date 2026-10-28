import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ok, fail, unauthorized, handle } from '@/lib/api';
import { env } from '@/lib/env';
import { getIdentityAdapter } from '@/lib/adapters/identity';

const manualSchema = z.object({
  realName: z.string().trim().min(2, '请填写真实姓名').max(40),
});

/** POST /api/account/identity — begin identity verification. */
export function POST(req: Request) {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();

    const adapter = getIdentityAdapter();
    if (!adapter.configured) {
      return fail('当前站点未启用实名认证', 503);
    }

    const me = await db.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, identityStatus: true },
    });
    if (me?.identityStatus === 'VERIFIED') return fail('你已完成实名认证', 409);

    // 人工认证：只存真实姓名，材料核对走线下；不收集证件号。
    if (adapter.driver === 'manual') {
      const { realName } = manualSchema.parse(await req.json().catch(() => ({})));
      await db.user.update({
        where: { id: session.user.id },
        data: {
          realName,
          identityStatus: 'PENDING',
          identityProvider: 'manual',
          identityRef: null,
        },
      });
      await db.auditLog.create({
        data: { userId: session.user.id, action: 'identity.manual_submitted', entity: 'User' },
      });
      return ok({ manual: true });
    }

    const { url, ref } = await adapter.startVerification({
      userId: session.user.id,
      email: me?.email ?? null,
      returnUrl: `${env.NEXT_PUBLIC_APP_URL}/settings/security?identity=done`,
    });

    await db.user.update({
      where: { id: session.user.id },
      data: {
        identityStatus: 'PENDING',
        identityProvider: adapter.driver,
        identityRef: ref,
      },
    });
    await db.auditLog.create({
      data: { userId: session.user.id, action: 'identity.session_started', entity: 'User' },
    });

    // The hosted flow shows the QR hand-off to continue on a phone camera.
    return ok({ url });
  });
}
