import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ok, fail, unauthorized, handle } from '@/lib/api';
import { isValidIban, looksLikeIban } from '@/lib/validations/iban';
import { sendMail } from '@/lib/mail/send';

const setSchema = z.object({
  provider: z.enum([
    'ALIPAY',
    'WECHAT_PAY',
    'BANK_TRANSFER',
    'MANUAL',
    'STRIPE_CONNECT',
    'PAYPAL',
    'WISE',
    'CRYPTO_USDC',
  ]),
  // Display-only identifier (PayPal email, IBAN, wallet, …). Never a secret.
  detail: z.string().trim().max(200).optional(),
  // Account holder name — required for bank transfers (a wire needs both).
  holderName: z.string().trim().max(120).optional(),
});

/**
 * Per-provider sanity checks. This is NOT gateway verification (自由工作平台
 * is non-custodial — money never flows through us), but typos in payout
 * details cost people real money, so the obvious mistakes are caught here.
 */
function validateDetail(provider: string, detail: string | undefined, holderName: string | undefined) {
  if (provider === 'ALIPAY' || provider === 'WECHAT_PAY') {
    if (!holderName) return '请填写实名姓名';
  }
  if (provider === 'BANK_TRANSFER') {
    if (!holderName) return '请填写开户人真实姓名';
    if (detail && !/^[0-9 ]{12,30}$/.test(detail)) return '请填写有效的银行卡号';
  }
  if (provider === 'MANUAL') {
    if (!holderName) return '请填写开户人真实姓名';
    if (detail && looksLikeIban(detail) && !isValidIban(detail)) {
      return '该 IBAN 校验未通过，请仔细核对';
    }
  }
  if (provider === 'PAYPAL' && detail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(detail)) {
    return '请输入有效的 PayPal 邮箱地址';
  }
  if (provider === 'CRYPTO_USDC' && detail && !/^0x[a-fA-F0-9]{40}$/.test(detail)) {
    return '请输入有效的 EVM 钱包地址（0x…）';
  }
  return null;
}

/** GET /api/account/payout — the signed-in user's own payout method (or null). */
export function GET() {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { payoutProvider: true, payoutDetail: true, payoutHolderName: true },
    });
    return ok({
      provider: user?.payoutProvider ?? null,
      detail: user?.payoutDetail ?? null,
      holderName: user?.payoutHolderName ?? null,
    });
  });
}

/** POST /api/account/payout — set/replace the user's payout method. */
export function POST(req: Request) {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();
    const { provider, detail, holderName } = setSchema.parse(await req.json());

    const invalid = validateDetail(provider, detail, holderName);
    if (invalid) return fail(invalid, 422);

    await db.user.update({
      where: { id: session.user.id },
      data: {
        payoutProvider: provider,
        payoutDetail: detail || null,
        payoutHolderName: holderName || null,
      },
    });

    // Security notification — payout-detail changes are a classic fraud vector.
    if (session.user.email) {
      await sendMail(
        session.user.email,
        'Your payout method was updated',
        `Hi ${session.user.name ?? 'there'},\n\n` +
          `The payout method on your 自由工作平台 account was set to ${provider.toLowerCase().replace('_', ' ')}.\n\n` +
          `If you didn't make this change, secure your account immediately: [Account settings](${process.env.NEXT_PUBLIC_APP_URL}/settings/payments)`,
      );
    }

    return ok({ provider, detail: detail || null, holderName: holderName || null });
  });
}

/** DELETE /api/account/payout — remove the user's payout method. */
export function DELETE() {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();
    await db.user.update({
      where: { id: session.user.id },
      data: { payoutProvider: null, payoutDetail: null, payoutHolderName: null },
    });
    return ok({ provider: null, detail: null });
  });
}
