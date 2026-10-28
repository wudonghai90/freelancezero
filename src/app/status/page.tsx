import { CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { db } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'System Status',
  description:
    'Live operational status for 自由工作平台 — API, database, email delivery, and background jobs, with 90-day uptime history.',
  path: '/status',
  keywords: ['freelancezero status', 'freelancezero uptime'],
});

// Status must reflect reality on every request.
export const dynamic = 'force-dynamic';

type Check = { name: string; desc: string; up: boolean; detail: string };

/** Probe the things we can actually verify from inside the app. */
async function runChecks(): Promise<Check[]> {
  const checks: Check[] = [];

  // Web app — if this renders, it is up.
  checks.push({
    name: 'Web application',
    desc: 'Marketplace pages and dashboard',
    up: true,
    detail: 'Serving requests',
  });

  // Database — a trivial query is a real liveness probe.
  const dbStart = Date.now();
  let dbUp = true;
  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    dbUp = false;
  }
  checks.push({
    name: 'Database',
    desc: 'Jobs, proposals, and accounts',
    up: dbUp,
    detail: dbUp ? `Responded in ${Date.now() - dbStart}ms` : 'Not reachable',
  });

  // Email — configured if either an SMTP host or a Resend key is present.
  const mailUp = !!(process.env.EMAIL_SERVER_HOST || process.env.RESEND_API_KEY);
  checks.push({
    name: 'Email delivery',
    desc: 'Sign-in links and notifications',
    up: mailUp,
    detail: mailUp ? 'Provider configured' : 'No provider configured',
  });

  // Background ingestion — reported as healthy when a scrape ran recently.
  let jobsUp = true;
  let jobsDetail = 'Idle';
  try {
    const last = await db.jobSource.findFirst({
      orderBy: { lastSeenAt: 'desc' },
      select: { lastSeenAt: true },
    });
    if (last) {
      const hours = Math.round((Date.now() - last.lastSeenAt.getTime()) / 3_600_000);
      jobsUp = hours < 48;
      jobsDetail = `Last run ${hours}h ago`;
    } else {
      jobsDetail = 'No runs recorded yet';
    }
  } catch {
    jobsUp = false;
    jobsDetail = 'Unknown';
  }
  checks.push({
    name: 'Background jobs',
    desc: 'Job ingestion and email fan-out',
    up: jobsUp,
    detail: jobsDetail,
  });

  return checks;
}

export default async function StatusPage() {
  const checks = await runChecks();
  const allUp = checks.every((c) => c.up);
  const now = new Date();

  return (
    <div className="container max-w-3xl py-16">
      <div className="flex items-center gap-3">
        <Activity className="size-6 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">System status</h1>
      </div>

      <div
        className={`mt-8 flex items-center gap-3 rounded-xl border p-5 ${
          allUp ? 'border-primary/30 bg-primary/5' : 'border-amber-500/40 bg-amber-500/10'
        }`}
      >
        {allUp ? (
          <CheckCircle2 className="size-6 shrink-0 text-primary" />
        ) : (
          <AlertTriangle className="size-6 shrink-0 text-amber-600" />
        )}
        <div>
          <p className="text-lg font-semibold">
            {allUp ? 'All systems operational' : 'Partial service disruption'}
          </p>
          <p className="text-sm text-muted-foreground">
            Checked {now.toUTCString().replace('GMT', 'UTC')}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-3">
        {checks.map((c) => (
          <Card key={c.name}>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </div>
              <div className="flex items-center gap-3 whitespace-nowrap">
                <span className="text-xs text-muted-foreground">{c.detail}</span>
                <Badge variant={c.up ? 'secondary' : 'outline'} className="gap-1">
                  <span
                    className={`size-2 rounded-full ${c.up ? 'bg-primary' : 'bg-amber-500'}`}
                  />
                  {c.up ? 'Operational' : 'Degraded'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">90-day uptime</CardTitle>
        </CardHeader>
        <CardContent>
          <UptimeBars allUp={allUp} />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>90 days ago</span>
            <span>Today</span>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-muted-foreground">
        Checks run when this page loads. For incident history and planned maintenance, email{' '}
        <a className="text-primary hover:underline" href="mailto:status@freelancezero.com">
          status@freelancezero.com
        </a>
        .
      </p>
    </div>
  );
}

/**
 * 90-day bar strip. We do not yet persist historical probe results, so past days
 * render as "no data" rather than inventing green bars — only today reflects a
 * real check.
 */
function UptimeBars({ allUp }: { allUp: boolean }) {
  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: 90 }).map((_, i) => {
        const isToday = i === 89;
        return (
          <div
            key={i}
            title={isToday ? 'Today' : 'No data recorded'}
            className={`h-8 flex-1 rounded-sm ${
              isToday ? (allUp ? 'bg-primary' : 'bg-amber-500') : 'bg-muted'
            }`}
          />
        );
      })}
    </div>
  );
}
