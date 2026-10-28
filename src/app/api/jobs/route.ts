import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ok, created, forbidden, unauthorized, handle } from '@/lib/api';
import { createJobSchema } from '@/lib/validations/job';
import { slugify } from '@/lib/utils';
import { Prisma } from '@prisma/client';

/**
 * GET /api/jobs — public, paginated, filterable job feed.
 * Query params: q (keyword), skill (skillId, repeatable), budgetType, cursor.
 * Uses keyset pagination on (publishedAt, id) for stable, index-friendly paging.
 */
export function GET(req: Request) {
  return handle(async () => {
    const url = new URL(req.url);
    const q = url.searchParams.get('q')?.trim();
    const budgetType = url.searchParams.get('budgetType');
    const skillIds = url.searchParams.getAll('skill');
    const cursor = url.searchParams.get('cursor') ?? undefined;
    const take = Math.min(Number(url.searchParams.get('limit') ?? 20), 50);

    const where: Prisma.JobWhereInput = {
      status: 'OPEN',
      deletedAt: null,
      visibility: 'public',
      ...(budgetType ? { budgetType: budgetType as 'HOURLY' | 'FIXED' } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(skillIds.length ? { skills: { some: { skillId: { in: skillIds } } } } : {}),
    };

    const jobs = await db.job.findMany({
      where,
      take: take + 1, // fetch one extra to compute the next cursor
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        budgetType: true,
        budgetMin: true,
        budgetMax: true,
        currency: true,
        experience: true,
        publishedAt: true,
        skills: { select: { skill: { select: { id: true, name: true } } } },
        _count: { select: { proposals: true } },
      },
    });

    const nextCursor = jobs.length > take ? jobs.pop()!.id : null;
    return ok({ jobs, nextCursor });
  });
}

/**
 * POST /api/jobs — create a job. Clients and agency owners only, and only
 * after the anti-spam gates: confirmed email + admin approval.
 */
export function POST(req: Request) {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();
    if (!['CLIENT', 'AGENCY_OWNER', 'ADMIN'].includes(session.user.role)) {
      return forbidden();
    }

    const me = await db.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true, approvedAt: true },
    });
    if (!me?.emailVerified) return forbidden('请先验证邮箱后再发布需求（请查看收件箱）');
    if (!me.approvedAt) return forbidden('账号正在等待管理员审核，通过后即可发布需求');

    const body = createJobSchema.parse(await req.json());

    const job = await db.job.create({
      data: {
        clientId: session.user.id,
        title: body.title,
        slug: `${slugify(body.title)}-${Date.now().toString(36)}`,
        description: body.description,
        budgetType: body.budgetType,
        budgetMin: body.budgetMin,
        budgetMax: body.budgetMax,
        currency: body.currency,
        experience: body.experience,
        estimatedDays: body.estimatedDays,
        status: 'OPEN',
        publishedAt: new Date(),
        skills: { create: body.skillIds.map((skillId) => ({ skillId })) },
      },
      select: { id: true, slug: true },
    });

    await db.auditLog.create({
      data: { userId: session.user.id, action: 'job.publish', entity: 'Job', entityId: job.id },
    });

    return created(job);
  });
}
