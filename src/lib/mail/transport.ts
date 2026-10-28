/**
 * Shared nodemailer transport. Resolution order:
 *   1. Explicit EMAIL_SERVER_* (e.g. local Mailhog) — always wins when set.
 *   2. RESEND_API_KEY — send via Resend's SMTP relay (user "resend", key as
 *      password). This is the production path: prod sets no EMAIL_SERVER_HOST,
 *      so Resend is used, while local keeps catching mail in Mailhog.
 *   3. Neither — returns null; callers degrade gracefully (sendMail logs).
 */
import nodemailer, { type Transporter } from 'nodemailer';

let cached: Transporter | null | undefined;

export function getTransport(): Transporter | null {
  if (cached !== undefined) return cached;

  if (process.env.EMAIL_SERVER_HOST) {
    const port = Number(process.env.EMAIL_SERVER_PORT ?? 587);
    cached = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port,
      secure: port === 465,
      auth:
        process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD
          ? { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASSWORD }
          : undefined,
    });
    return cached;
  }

  if (process.env.RESEND_API_KEY) {
    cached = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: { user: 'resend', pass: process.env.RESEND_API_KEY },
    });
    return cached;
  }

  cached = null;
  return cached;
}

export const MAIL_FROM =
  process.env.EMAIL_FROM ?? '自由工作平台 <no-reply@freelancezero.com>';
