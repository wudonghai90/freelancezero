import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Briefcase } from 'lucide-react';
import { db } from '@/lib/db';
import { getOnboarding } from '@/lib/onboarding';
import { auth } from '@/lib/auth';
import { formatMoney } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { pageMetadata } from '@/lib/seo';

const FREELANCER_ROLES = ['FREELANCER', 'AGENCY_OWNER', 'AGENCY_MEMBER'];

const EXPERIENCE_LABEL: Record<string, string> = {
  ENTRY: '入门',
  INTERMEDIATE: '中级',
  EXPERT: '专家',
};

export const metadata = pageMetadata({
  title: '需求大厅 — 中文自由工作机会',
  description: '浏览中文自由工作需求，覆盖开发、设计、写作与营销。平台不抽佣，里程碑结算。',
  path: '/jobs',
  keywords: ['自由职业', '远程工作', '接单', '外包需求'],
});
export const dynamic = 'force-dynamic';

/** Public job feed. Finding work is for freelancers — clients hire instead. */
export default async function JobsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?next=/jobs');
  if (!FREELANCER_ROLES.includes(session.user.role)) redirect('/dashboard');
  const onboarding = await getOnboarding(session.user.id, session.user.role);
  if (!onboarding.complete) redirect('/onboarding');

  const jobs = await db.job.findMany({
    where: { status: 'OPEN', deletedAt: null, visibility: 'public' },
    orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
    take: 30,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      budgetType: true,
      budgetMin: true,
      budgetMax: true,
      currency: true,
      experience: true,
      skills: { select: { skill: { select: { id: true, name: true } } } },
      _count: { select: { proposals: true } },
    },
  });

  return (
    <div className="container py-12">
      <div className="mb-8 flex items-center gap-3">
        <Briefcase className="text-primary" />
        <h1 className="text-3xl font-bold">需求大厅</h1>
        <Badge variant="secondary">{jobs.length} 个在招</Badge>
      </div>

      {jobs.length === 0 ? (
        <p className="text-muted-foreground">暂无开放需求，稍后再来看看。</p>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.slug}`} className="block">
              <Card className="transition-colors hover:border-primary">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <span className="whitespace-nowrap text-sm font-semibold text-primary">
                      {formatBudget(job)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      {EXPERIENCE_LABEL[job.experience] ?? job.experience}
                    </Badge>
                    {job.skills.map((s) => (
                      <Badge key={s.skill.id}>{s.skill.name}</Badge>
                    ))}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {job._count.proposals} 份投标
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function formatBudget(job: {
  budgetType: 'HOURLY' | 'FIXED';
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
}): string {
  const { budgetMin, budgetMax, currency } = job;
  if (budgetMin == null && budgetMax == null) return '预算待定';
  if (job.budgetType === 'FIXED') return `${formatMoney(budgetMax ?? budgetMin!, currency)}（固定价）`;
  const lo = budgetMin != null ? formatMoney(budgetMin, currency) : '';
  const hi = budgetMax != null ? formatMoney(budgetMax, currency) : '';
  return `${[lo, hi].filter(Boolean).join(' – ')}/小时`;
}
