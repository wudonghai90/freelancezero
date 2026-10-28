import NextAuth, { type DefaultSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Nodemailer from 'next-auth/providers/nodemailer';
import type { Provider } from 'next-auth/providers';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getTransport, MAIL_FROM } from '@/lib/mail/transport';
import type { UserRole } from '@prisma/client';

// Extend the session type so `session.user.role` / `.id` are strongly typed.
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }
}

const credentialsSchema = z.object({
  // Normalized the same way as registration, so casing never breaks sign-in.
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
});

/**
 * Providers are added conditionally: if a provider's credentials are absent
 * from the environment, its button simply won't appear. This keeps the
 * self-hosting story simple — enable only what you configure.
 */
const providers: Provider[] = [
  /**
   * One-click sign-in for recruiters from the "someone applied" email.
   *
   * The emailed link carries a high-entropy token (RecruiterAccessToken),
   * scoped to one company shell and expiring after 7 days.
   *
   * Deliberately NOT single-use: corporate mail scanners routinely pre-fetch
   * links, which would burn a one-shot token before the human ever clicks and
   * leave them staring at "link expired". The bounded window is the mitigation
   * instead. `usedAt` records first use for the audit trail only.
   */
  Credentials({
    id: 'recruiter-token',
    name: 'Recruiter link',
    credentials: { token: {} },
    async authorize(raw) {
      const token = typeof raw?.token === 'string' ? raw.token : null;
      if (!token) return null;

      const row = await db.recruiterAccessToken.findUnique({
        where: { token },
        select: { id: true, userId: true, expiresAt: true, usedAt: true },
      });
      if (!row) return null;
      if (row.expiresAt && row.expiresAt < new Date()) return null;

      const user = await db.user.findUnique({
        where: { id: row.userId },
        select: { id: true, email: true, name: true, image: true, deletedAt: true },
      });
      if (!user || user.deletedAt) return null;

      // Record first use (audit trail), then the sign-in itself.
      if (!row.usedAt) {
        await db.recruiterAccessToken.update({
          where: { id: row.id },
          data: { usedAt: new Date() },
        });
      }
      await db.auditLog.create({
        data: { userId: user.id, action: 'user.login_recruiter_link', entity: 'User' },
      });

      return { id: user.id, email: user.email, name: user.name, image: user.image };
    },
  }),

  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;

      const user = await db.user.findUnique({
        where: { email: parsed.data.email },
      });
      if (!user?.passwordHash) return null;

      const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!ok) return null;

      // 2FA, when enabled, is verified in a dedicated step after this.
      return { id: user.id, email: user.email, name: user.name, image: user.image };
    },
  }),
];

// `allowDangerousEmailAccountLinking` lets a Google/GitHub sign-in attach to an
// existing user with the same (provider-verified) email — including a scraped
// UNCLAIMED recruiter shell. That linking-by-email is exactly what "claiming"
// the shell means here, and Google/GitHub both verify the address.
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google({ allowDangerousEmailAccountLinking: true }));
}
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(GitHub({ allowDangerousEmailAccountLinking: true }));
}
if (process.env.EMAIL_SERVER_HOST || process.env.RESEND_API_KEY) {
  providers.push(
    Nodemailer({
      // Prefer an explicit SMTP server (e.g. local Mailhog); otherwise fall back
      // to Resend — so magic-link login works in production (Resend, no
      // EMAIL_SERVER_HOST) too. Actual delivery goes through getTransport() in
      // sendVerificationRequest below; this `server` just needs to be valid.
      server: process.env.EMAIL_SERVER_HOST
        ? {
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
            auth:
              process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD
                ? {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                  }
                : undefined,
          }
        : {
            host: 'smtp.resend.com',
            port: 465,
            secure: true,
            auth: { user: 'resend', pass: process.env.RESEND_API_KEY ?? '' },
          },
      from: process.env.EMAIL_FROM,
      // Send through our shared transport, which correctly skips SMTP AUTH when
      // no credentials are set (e.g. local Mailhog). The provider's built-in
      // transport otherwise attempts PLAIN auth and fails against auth-less MTAs.
      async sendVerificationRequest({ identifier, url }) {
        const transport = getTransport();
        if (!transport) throw new Error('Email transport is not configured');
        await transport.sendMail({
          to: identifier,
          from: MAIL_FROM,
          subject: 'Sign in to 自由工作平台',
          text: `Sign in to 自由工作平台:\n${url}\n\nIf you didn't request this, you can ignore it.`,
          html: `<p>Sign in to 自由工作平台:</p><p><a href="${url}">Sign in</a></p><p style="color:#777;font-size:13px">Or paste this link:<br/>${url}</p>`,
        });
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  // JWT sessions keep the credentials provider working without a DB round-trip
  // on every request; Auth.js requires this strategy alongside Credentials.
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers,
  events: {
    // First successful sign-in "claims" a scraped recruiter shell: an UNCLAIMED
    // account becomes a normal ACTIVE user with a verified email. Any auth
    // method (magic link, Google, GitHub) triggers this.
    async signIn({ user }) {
      if (!user?.id) return;
      await db.user.updateMany({
        where: { id: user.id, status: 'UNCLAIMED' },
        data: { status: 'ACTIVE', emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On sign-in, enrich the token with the user's role and photo.
      if (user?.id) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true, image: true, name: true },
        });
        token.role = dbUser?.role ?? 'CLIENT';
        token.uid = user.id;
        token.picture = dbUser?.image ?? null;
        token.name = dbUser?.name ?? token.name;
      } else if (trigger === 'update' && token.uid) {
        // Profile changed (e.g. avatar upload). JWT sessions are not backed by
        // a DB read per request, so the client calls `useSession().update()`
        // and we re-sync the mutable fields here.
        const dbUser = await db.user.findUnique({
          where: { id: token.uid as string },
          select: { role: true, image: true, name: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.picture = dbUser.image ?? null;
          token.name = dbUser.name ?? token.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.role = token.role as UserRole;
        session.user.image = (token.picture as string | null) ?? null;
        session.user.name = (token.name as string | null) ?? session.user.name;
      }
      return session;
    },
  },
});
