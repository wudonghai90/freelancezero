import { db } from '@/lib/db';
import { ok, fail, handle } from '@/lib/api';
import { getIdentityAdapter } from '@/lib/adapters/identity';
import { sendMail } from '@/lib/mail/send';

/**
 * POST /api/webhooks/identity — provider callback with the verification result.
 *
 * The outcome is only ever taken from this server-to-server call, never from the
 * browser return URL, which a user could forge.
 */
export function POST(req: Request) {
  return handle(async () => {
    const adapter = getIdentityAdapter();
    if (!adapter.configured) return fail('未启用实名认证', 503);

    const raw = await req.text();
    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return fail('请求数据无效', 400);
    }

    const result = adapter.parseWebhook(payload);
    if (!result) return ok({ ignored: true });

    const user = await db.user.findFirst({
      where: { identityRef: result.ref },
      select: { id: true, email: true, name: true, identityStatus: true },
    });
    if (!user) return ok({ ignored: true });
    if (user.identityStatus === result.status) return ok({ duplicate: true });

    await db.user.update({
      where: { id: user.id },
      data: {
        identityStatus: result.status,
        identityVerifiedAt: result.status === 'VERIFIED' ? new Date() : null,
      },
    });
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: `identity.${result.status.toLowerCase()}`,
        entity: 'User',
        entityId: user.id,
      },
    });

    if (user.email && result.status !== 'PROCESSING') {
      await sendMail(
        user.email,
        result.status === 'VERIFIED' ? 'Your identity is verified' : 'Identity check unsuccessful',
        result.status === 'VERIFIED'
          ? `Hi ${user.name ?? 'there'},\n\nYour identity has been verified — a verified badge now shows on your public profile.`
          : `Hi ${user.name ?? 'there'},\n\nWe couldn't verify your identity from the documents provided. You can try again from your security settings.`,
      );
    }

    return ok({ status: result.status });
  });
}
