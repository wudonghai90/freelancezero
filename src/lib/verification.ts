import { randomBytes } from 'node:crypto';
import { db } from '@/lib/db';
import { sendMail } from '@/lib/mail/send';

const TTL_MS = 24 * 60 * 60 * 1000; // 24h

/** Create a one-time email-confirmation token and send it to the user. */
export async function sendVerificationEmail(user: { email: string; name: string | null }) {
  const token = randomBytes(32).toString('hex');
  await db.verificationToken.create({
    data: { identifier: user.email, token, expires: new Date(Date.now() + TTL_MS) },
  });

  const link = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}&email=${encodeURIComponent(user.email)}`;
  await sendMail(
    user.email,
    '请验证你的邮箱 — 自由工作平台',
    `你好，${user.name ?? '用户'}：\n\n` +
      `请验证邮箱地址以完成账号设置：\n[验证邮箱](${link})\n\n` +
      `链接 24 小时内有效。如果这不是你本人的操作，请忽略此邮件。`,
  );
}
