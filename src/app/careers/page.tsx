import Link from 'next/link';
import { MapPin, Clock, Heart, Globe2, Scale, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Careers — Build the Fair Freelance Marketplace',
  description:
    'Join 自由工作平台 and help build the zero-fee, open-source freelance marketplace. Remote-first roles in engineering, design, and growth.',
  path: '/careers',
  keywords: ['freelancezero careers', 'remote startup jobs', 'open source jobs'],
});

const ROLES = [
  {
    slug: 'senior-software-engineer',
    title: 'Senior Software Engineer',
    team: 'Engineering',
    location: 'Remote (global)',
    type: 'Full-time',
    blurb:
      'Own features end-to-end across our Next.js + Prisma stack — from the job feed to payments adapters. You’ll ship weekly and shape the core product.',
  },
  {
    slug: 'hr-recruiter',
    title: 'HR Recruiter',
    team: 'People',
    location: 'Remote (global)',
    type: 'Full-time',
    blurb:
      'Build the team that builds the fair freelance economy. Own hiring end-to-end — sourcing, screening, and giving every candidate a genuinely good experience.',
  },
  {
    slug: 'marketing',
    title: 'Marketing',
    team: 'Growth',
    location: 'Remote (global)',
    type: 'Full-time',
    blurb:
      'Own our content and SEO engine. Turn “Upwork alternative” intent into signups with pages people actually want to read — and a brand freelancers trust.',
  },
];

const PERKS = [
  { icon: Globe2, title: 'Remote-first', desc: 'Work from anywhere. We optimize for outcomes, not hours.' },
  { icon: Scale, title: 'Fair by design', desc: 'We take 0% from freelancers — and pay our team fairly too.' },
  { icon: Heart, title: 'Real ownership', desc: 'Meaningful equity and a say in what we build.' },
  { icon: Sparkles, title: 'Open source', desc: 'Your work is public, portable, and something to be proud of.' },
];

export default function CareersPage() {
  return (
    <div className="container max-w-4xl py-16">
      <div className="text-center">
        <Badge variant="secondary" className="mb-4">We’re hiring</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Build the fair freelance economy</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          自由工作平台 is a 100% free, open-source marketplace where freelancers keep everything they
          earn. We’re a small, remote team building for people — not shareholders.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PERKS.map((p) => (
          <Card key={p.title}>
            <CardHeader className="pb-2">
              <p.icon className="size-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{p.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold">Open roles</h2>
        <p className="mt-1 text-muted-foreground">{ROLES.length} positions · all remote</p>

        <div className="mt-6 grid gap-4">
          {ROLES.map((role) => (
            <Card key={role.slug} className="transition-colors hover:border-primary">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">{role.title}</CardTitle>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <Badge variant="outline">{role.team}</Badge>
                      <span className="inline-flex items-center gap-1"><MapPin className="size-4" /> {role.location}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="size-4" /> {role.type}</span>
                    </div>
                  </div>
                  <Button asChild>
                    <a href={`mailto:careers@freelancezero.com?subject=Application: ${encodeURIComponent(role.title)}`}>
                      Apply
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{role.blurb}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-xl border bg-muted/30 p-8 text-center">
        <h2 className="text-xl font-semibold">Don’t see your role?</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          We’re always keen to meet people who believe in a fairer freelance economy. Tell us what you’d
          build.
        </p>
        <Button asChild className="mt-4">
          <a href="mailto:careers@freelancezero.com?subject=General application">Get in touch</a>
        </Button>
      </div>
    </div>
  );
}
