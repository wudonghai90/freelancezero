import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ok, fail, forbidden, unauthorized, handle } from '@/lib/api';

const schema = z.object({
  userId: z.string().cuid(),
  // Curation fields — admins fix data quality on scraped and real accounts.
  name: z.string().trim().max(120).optional(),
  companyName: z.string().trim().max(120).optional(),
  headline: z.string().trim().max(120).optional(),
  contactEmail: z.string().trim().email('请输入有效的邮箱地址').or(z.literal('')).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED', 'UNCLAIMED']).optional(),
  approved: z.boolean().optional(),
  // 人工实名审核：通过后写入 VERIFIED，撤销则回到 UNVERIFIED。
  identityVerified: z.boolean().optional(),
});

/** PATCH /api/admin/users — curate a user record. Admin only. */
export function PATCH(req: Request) {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();
    if (session.user.role !== 'ADMIN') return forbidden();

    const body = schema.parse(await req.json());

    const target = await db.user.findUnique({
      where: { id: body.userId },
      select: { id: true, role: true },
    });
    if (!target) return fail('用户不存在', 404);

    // Account-level fields.
    const userData = {
      ...(body.name !== undefined ? { name: body.name || null } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.approved !== undefined
        ? { approvedAt: body.approved ? new Date() : null }
        : {}),
      ...(body.identityVerified !== undefined
        ? body.identityVerified
          ? { identityStatus: 'VERIFIED' as const, identityVerifiedAt: new Date() }
          : { identityStatus: 'UNVERIFIED' as const, identityVerifiedAt: null }
        : {}),
    };
    if (Object.keys(userData).length) {
      await db.user.update({ where: { id: body.userId }, data: userData });
    }

    // Company name lives on the client profile.
    if (body.companyName !== undefined) {
      await db.clientProfile.upsert({
        where: { userId: body.userId },
        update: { companyName: body.companyName || null },
        create: { userId: body.userId, companyName: body.companyName || null },
      });
    }

    // Headline lives on the freelancer profile.
    if (body.headline !== undefined) {
      await db.freelancerProfile.upsert({
        where: { userId: body.userId },
        update: { headline: body.headline || null },
        create: { userId: body.userId, headline: body.headline || null },
      });
    }

    // The recruiter contact address for scraped company shells.
    if (body.contactEmail !== undefined) {
      const existing = await db.recruiterContact.findUnique({
        where: { userId: body.userId },
        select: { id: true },
      });
      if (body.contactEmail) {
        const data = {
          email: body.contactEmail,
          // An admin typing an address is a deliberate, verified act.
          origin: 'PUBLISHED' as const,
          status: 'DELIVERABLE' as const,
          confidence: 0.95,
          contactable: true,
          verifiedAt: new Date(),
          suppressedAt: null,
          unsubscribedAt: null,
        };
        if (existing) {
          await db.recruiterContact.update({ where: { userId: body.userId }, data });
        } else {
          await db.recruiterContact.create({ data: { userId: body.userId, ...data } });
        }
      } else if (existing) {
        await db.recruiterContact.update({
          where: { userId: body.userId },
          data: { contactable: false },
        });
      }
    }

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'admin.user_update',
        entity: 'User',
        entityId: body.userId,
        metadata: body,
      },
    });

    return ok({ updated: true });
  });
}
