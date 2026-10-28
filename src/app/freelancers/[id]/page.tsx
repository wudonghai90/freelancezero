import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, Star, MapPin, Globe, Github, Clock, Briefcase,
  Linkedin, Dribbble, Twitter, Code2, Palette, Award, BadgeCheck,
} from 'lucide-react';
import { db } from '@/lib/db';
import { formatMoney, initials, displayName } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { SITE, pageMetadata, jsonLdScript } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const AVAILABILITY: Record<string, string> = {
  OPEN_TO_WORK: 'Open to work',
  OPEN_TO_OFFERS: 'Open to offers',
  NOT_AVAILABLE: 'Not available',
};

/**
 * Fetch a profile and immediately reduce the legal name to its public form.
 * The raw name is never returned, so it cannot leak into the serialized RSC
 * payload — "Jordan D." must not be recoverable from view-source.
 */
async function getProfile(id: string) {
  const p = await getProfileRaw(id);
  if (!p) return null;
  const { user, ...rest } = p;
  return {
    ...rest,
    publicName: displayName(user.name, user.showFullName),
    avatarInitials: initials(user.name),
    image: user.image,
    indexProfile: user.indexProfile,
    identityVerified: user.identityStatus === 'VERIFIED',
    status: user.status,
    deletedAt: user.deletedAt,
  };
}

function getProfileRaw(id: string) {
  return db.freelancerProfile.findUnique({
    where: { id },
    select: {
      id: true,
      headline: true,
      bio: true,
      hourlyRate: true,
      currency: true,
      availability: true,
      hoursPerWeek: true,
      location: true,
      websiteUrl: true,
      githubUrl: true,
      linkedinUrl: true,
      dribbbleUrl: true,
      behanceUrl: true,
      stackoverflowUrl: true,
      xUrl: true,
      timezone: true,
      yearsExperience: true,
      ratingAvg: true,
      ratingCount: true,
      user: {
        select: {
          name: true, image: true, showFullName: true,
          indexProfile: true, status: true, deletedAt: true, identityStatus: true,
        },
      },
      skills: { select: { skill: { select: { id: true, name: true } }, endorsements: true } },
      portfolioItems: {
        orderBy: { order: 'asc' },
        select: { id: true, title: true, description: true, externalUrl: true },
      },
      workHistory: {
        orderBy: { startDate: 'desc' },
        select: { id: true, company: true, title: true, description: true, startDate: true, endDate: true },
      },
      languages: { select: { id: true, language: true, level: true } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getProfile(id);
  if (!p) return pageMetadata({ title: 'Freelancer not found', path: '/freelancers', noIndex: true });

  // Profiles are public and indexed by default — free inbound lead flow for the
  // freelancer — unless they opted out in privacy settings.
  const skills = p.skills.map((s) => s.skill.name);
  const where = p.location ? ` in ${p.location}` : '';
  const description =
    p.bio?.replace(/\s+/g, ' ').slice(0, 155) ??
    `Hire ${p.publicName}${where} — ${p.headline ?? 'freelancer'}${
      skills.length ? `, skilled in ${skills.slice(0, 4).join(', ')}` : ''
    }. Zero platform fees on 自由工作平台.`;

  return pageMetadata({
    title: `${p.publicName} — ${p.headline ?? 'Freelancer'}${where}`,
    description,
    path: `/freelancers/${p.id}`,
    keywords: [
      ...skills,
      `hire ${p.headline ?? 'freelancer'}`,
      ...(p.location ? [`freelancer ${p.location}`] : []),
    ],
    noIndex: !p.indexProfile,
  });
}

export default async function FreelancerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getProfile(id);
  if (!p || p.deletedAt || p.status !== 'ACTIVE') notFound();

  const name = p.publicName;

  const links = (
    [
      { href: p.websiteUrl, label: 'Website', Icon: Globe },
      { href: p.linkedinUrl, label: 'LinkedIn', Icon: Linkedin },
      { href: p.githubUrl, label: 'GitHub', Icon: Github },
      { href: p.stackoverflowUrl, label: 'Stack Overflow', Icon: Code2 },
      { href: p.dribbbleUrl, label: 'Dribbble', Icon: Dribbble },
      { href: p.behanceUrl, label: 'Behance', Icon: Palette },
      { href: p.xUrl, label: 'X', Icon: Twitter },
    ] as const
  ).filter((l): l is typeof l & { href: string } => !!l.href);

  // Rich Person schema so search engines can surface the profile properly.
  // Only emitted when the freelancer allows indexing.
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle: p.headline ?? undefined,
    description: p.bio ?? undefined,
    url: `${SITE.url}/freelancers/${p.id}`,
    image: p.image ? `${SITE.url}${p.image}` : undefined,
    knowsAbout: p.skills.map((s) => s.skill.name),
    ...(p.location ? { homeLocation: { '@type': 'Place', name: p.location } } : {}),
    ...(p.ratingCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: p.ratingAvg.toFixed(1),
            reviewCount: p.ratingCount,
          },
        }
      : {}),
    ...(p.hourlyRate
      ? {
          makesOffer: {
            '@type': 'Offer',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: (p.hourlyRate / 100).toFixed(2),
              priceCurrency: p.currency,
              unitCode: 'HUR',
            },
          },
        }
      : {}),
  };

  return (
    <div className="container max-w-3xl py-12">
      {p.indexProfile ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(personJsonLd)} />
      ) : null}

      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/">
          <ArrowLeft /> 自由工作平台
        </Link>
      </Button>

      <div className="flex flex-wrap items-start gap-5">
        <Avatar className="size-20">
          {p.image ? <AvatarImage src={p.image} alt="" /> : null}
          <AvatarFallback className="text-xl">{p.avatarInitials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            {name}
            {p.identityVerified ? (
              <span title="Identity verified" className="inline-flex">
                <BadgeCheck className="size-6 text-primary" aria-label="Identity verified" />
              </span>
            ) : null}
          </h1>
          {p.headline ? <p className="mt-1 text-lg text-muted-foreground">{p.headline}</p> : null}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary">{AVAILABILITY[p.availability] ?? p.availability}</Badge>
            {p.ratingCount > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Star className="size-4 fill-primary text-primary" />
                {p.ratingAvg.toFixed(1)} ({p.ratingCount})
              </span>
            ) : (
              <span>No reviews yet</span>
            )}
            {p.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" /> {p.location}
              </span>
            ) : null}
            {p.timezone ? <span>{p.timezone}</span> : null}
            {p.hoursPerWeek ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-4" /> {p.hoursPerWeek}h/week
              </span>
            ) : null}
            {p.yearsExperience ? (
              <span className="inline-flex items-center gap-1">
                <Award className="size-4" /> {p.yearsExperience} yrs experience
              </span>
            ) : null}
          </div>
        </div>
        {p.hourlyRate ? (
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {formatMoney(p.hourlyRate, p.currency)}
            </p>
            <p className="text-xs text-muted-foreground">per hour</p>
          </div>
        ) : null}
      </div>

      {links.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {links.map(({ href, label, Icon }) => (
            <Button key={label} asChild variant="outline" size="sm">
              <a href={href} target="_blank" rel="noopener noreferrer nofollow">
                <Icon /> {label}
              </a>
            </Button>
          ))}
        </div>
      ) : null}

      {p.skills.length ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {p.skills.map((s) => (
            <Badge key={s.skill.id}>{s.skill.name}</Badge>
          ))}
        </div>
      ) : null}

      {p.bio ? (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {p.bio}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {p.portfolioItems.length ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {p.portfolioItems.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <p className="font-medium">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                ) : null}
                {item.externalUrl ? (
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="mt-2 inline-block text-sm text-primary hover:underline"
                  >
                    View project
                  </a>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {p.workHistory.length ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="size-5 text-primary" /> Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {p.workHistory.map((w) => (
              <div key={w.id}>
                <p className="font-medium">
                  {w.title} · <span className="text-muted-foreground">{w.company}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {w.startDate ? w.startDate.getFullYear() : '—'} –{' '}
                  {w.endDate ? w.endDate.getFullYear() : 'Present'}
                </p>
                {w.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{w.description}</p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {p.languages.length ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Languages</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {p.languages.map((l) => (
              <Badge key={l.id} variant="outline">
                {l.language} — {l.level}
              </Badge>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
