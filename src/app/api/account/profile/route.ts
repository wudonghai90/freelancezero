import { after } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { runAutoReview } from '@/lib/ai/moderation';
import { ok, forbidden, unauthorized, handle } from '@/lib/api';
import { profileSchema } from '@/lib/validations/profile';
import { recomputeCompleteness } from '@/lib/profile-completeness';

/** Empty string clears the column; undefined leaves it untouched. */
function optionalText(value: string | undefined) {
  return value === undefined ? {} : { value: value || null };
}

/** POST /api/account/profile — update the freelancer's public profile. */
export function POST(req: Request) {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();
    if (!['FREELANCER', 'AGENCY_OWNER', 'AGENCY_MEMBER'].includes(session.user.role)) {
      return forbidden();
    }

    const body = profileSchema.parse(await req.json());

    const links = {
      websiteUrl: body.websiteUrl,
      githubUrl: body.githubUrl,
      linkedinUrl: body.linkedinUrl,
      dribbbleUrl: body.dribbbleUrl,
      behanceUrl: body.behanceUrl,
      stackoverflowUrl: body.stackoverflowUrl,
      xUrl: body.xUrl,
    };

    const data = {
      headline: body.headline,
      location: body.location,
      bio: body.bio || null,
      ...(body.hourlyRate != null ? { hourlyRate: body.hourlyRate * 100 } : {}),
      ...(body.hoursPerWeek != null ? { hoursPerWeek: body.hoursPerWeek } : {}),
      ...(body.yearsExperience != null ? { yearsExperience: body.yearsExperience } : {}),
      ...(body.availability ? { availability: body.availability } : {}),
      ...(body.timezone !== undefined ? { timezone: body.timezone || null } : {}),
      // Link fields: only touch the ones actually submitted.
      ...Object.fromEntries(
        Object.entries(links).flatMap(([key, value]) => {
          const next = optionalText(value);
          return 'value' in next ? [[key, next.value]] : [];
        }),
      ),
    };

    await db.freelancerProfile.upsert({
      where: { userId: session.user.id },
      update: data,
      create: { userId: session.user.id, ...data },
    });

    // Keep the denormalized score fresh — it drives ranking and the
    // proposal quality score.
    const completeness = await recomputeCompleteness(session.user.id);

    after(() =>
      runAutoReview(session.user.id).catch((err) => console.error('[ai-moderation]', err)),
    );

    return ok({ headline: body.headline, completeness });
  });
}
