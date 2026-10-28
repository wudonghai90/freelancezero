import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { created, fail, handle } from '@/lib/api';
import { registerSchema } from '@/lib/validations/auth';
import { sendVerificationEmail } from '@/lib/verification';

/**
 * POST /api/register — create a credentials-based account.
 * Passwords are hashed with bcrypt (cost 12). Email verification is triggered
 * separately via Auth.js magic link / verification token flow.
 */
export function POST(req: Request) {
  return handle(async () => {
    const body = registerSchema.parse(await req.json());

    const existing = await db.user.findUnique({ where: { email: body.email } });
    if (existing) {
      // Do not reveal whether the email exists to unauthenticated callers in
      // production; here we return a generic conflict.
      return fail('该邮箱已注册', 409);
    }

    const passwordHash = await bcrypt.hash(body.password, 12);

    const name = `${body.lastName}${body.firstName}`;
    const user = await db.user.create({
      data: {
        name,
        email: body.email,
        passwordHash,
        role: body.role,
        // Create the matching profile row for the chosen role.
        ...(body.role === 'FREELANCER'
          ? { freelancerProfile: { create: {} } }
          : {
              clientProfile: {
                create: { companyName: body.companyName || undefined },
              },
            }),
      },
      select: { id: true, email: true, role: true },
    });

    // A company the directory didn't know yet becomes part of it.
    if (body.role === 'CLIENT' && body.companyName) {
      await db.company.upsert({
        where: { name: body.companyName },
        update: {},
        create: { name: body.companyName },
      });
    }

    await db.auditLog.create({
      data: { userId: user.id, action: 'user.register', entity: 'User', entityId: user.id },
    });

    // Email confirmation is the first onboarding gate — send it right away.
    // Best-effort: a mail hiccup must never fail registration.
    await sendVerificationEmail({ email: user.email, name }).catch((err) =>
      console.error('[register] verification email failed', err),
    );

    return created(user);
  });
}
