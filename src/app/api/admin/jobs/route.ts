import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ok, fail, forbidden, unauthorized, handle } from '@/lib/api';

const schema = z.object({
  jobId: z.string().cuid(),
  title: z.string().trim().min(4).max(200).optional(),
  description: z.string().trim().max(20_000).optional(),
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'CANCELLED']).optional(),
  /** Company name for the posting's owner shell. */
  companyName: z.string().trim().max(120).optional(),
  /** Recruiter contact address — what makes a draft publishable. */
  contactEmail: z.string().trim().email('请输入有效的邮箱地址').or(z.literal('')).optional(),
});

/**
 * PATCH /api/admin/jobs — curate a posting. Admins fix scraped data quality and
 * publish drafts once a contact address exists.
 */
export function PATCH(req: Request) {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();
    if (session.user.role !== 'ADMIN') return forbidden();

    const body = schema.parse(await req.json());

    const job = await db.job.findUnique({
      where: { id: body.jobId },
      select: { id: true, clientId: true },
    });
    if (!job) return fail('需求不存在', 404);

    // An admin-entered address is a deliberate, verified act.
    if (body.contactEmail) {
      const existing = await db.recruiterContact.findUnique({
        where: { userId: job.clientId },
        select: { id: true },
      });
      const data = {
        email: body.contactEmail,
        origin: 'PUBLISHED' as const,
        status: 'DELIVERABLE' as const,
        confidence: 0.95,
        contactable: true,
        verifiedAt: new Date(),
        suppressedAt: null,
        unsubscribedAt: null,
      };
      if (existing) {
        await db.recruiterContact.update({ where: { userId: job.clientId }, data });
      } else {
        await db.recruiterContact.create({ data: { userId: job.clientId, ...data } });
      }
    }

    if (body.companyName !== undefined) {
      await db.clientProfile.upsert({
        where: { userId: job.clientId },
        update: { companyName: body.companyName || null },
        create: { userId: job.clientId, companyName: body.companyName || null },
      });
      await db.user.update({
        where: { id: job.clientId },
        data: { name: body.companyName || null },
      });
    }

    // Refuse to publish a posting nobody can be notified about — that is the
    // dead end this whole curation step exists to prevent.
    if (body.status === 'OPEN') {
      const contact = await db.recruiterContact.findUnique({
        where: { userId: job.clientId },
        select: { contactable: true },
      });
      const owner = await db.user.findUnique({
        where: { id: job.clientId },
        select: { status: true },
      });
      const reachable = contact?.contactable || owner?.status !== 'UNCLAIMED';
      if (!reachable) {
        return fail('发布前请填写联系邮箱，方便投标人联系', 422);
      }
    }

    const jobData = {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.status === 'OPEN' ? { publishedAt: new Date() } : {}),
    };
    if (Object.keys(jobData).length) {
      await db.job.update({ where: { id: body.jobId }, data: jobData });
    }

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'admin.job_update',
        entity: 'Job',
        entityId: body.jobId,
        metadata: body,
      },
    });

    return ok({ updated: true });
  });
}
