import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ok, fail, unauthorized, handle } from '@/lib/api';
import { sendMail } from '@/lib/mail/send';

const schema = z.object({
  // Absent when the account has no password yet (social / magic-link sign-up).
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8, '密码至少 8 位')
    .max(200, '密码最多 200 位')
    .regex(/[a-z]/, '密码需包含小写字母')
    .regex(/[A-Z]/, '密码需包含大写字母')
    .regex(/[0-9]/, '密码需包含数字'),
});

/** POST /api/account/password — set or change the account password. */
export function POST(req: Request) {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();

    const { currentPassword, newPassword } = schema.parse(await req.json());

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true, email: true, name: true },
    });
    if (!user) return unauthorized();

    // Accounts that already have a password must prove they know it.
    if (user.passwordHash) {
      if (!currentPassword) return fail('请输入当前密码', 422);
      const okCurrent = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!okCurrent) return fail('当前密码不正确', 422);
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { passwordHash: await bcrypt.hash(newPassword, 12) },
    });

    await db.auditLog.create({
      data: { userId: session.user.id, action: 'user.password_change', entity: 'User' },
    });

    // Password changes are a takeover signal — always tell the account owner.
    if (user.email) {
      await sendMail(
        user.email,
        'Your password was changed',
        `Hi ${user.name ?? 'there'},\n\n` +
          `The password on your 自由工作平台 account was just changed.\n\n` +
          `If this wasn't you, reset your password immediately and contact support.`,
      );
    }

    return ok({ updated: true });
  });
}
