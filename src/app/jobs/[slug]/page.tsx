import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock, Star, Users, CheckCircle2, Lock } from 'lucide-react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { formatMoney, initials, displayName } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ApplyForm } from './apply-form';

export const dynamic = 'force-dynamic';

const FREELANCER_ROLES = ['FREELANCER', 'AGENCY_OWNER', 'AGENCY_MEMBER'];

const EXPERIENCE_LABEL: Record<string, string> = {
  ENTRY: '入门',
  INTERMEDIATE: '中级',
  EXPERT: '专家',
};

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await db.job.findUnique({
    where: { slug },
    include: {
      skills: { select: { skill: { select: { id: true, name: true } } } },
      client: {
        select: {
          name: true,
          image: true,
          showFullName: true,
          clientProfile: {
            select: { companyName: true, paymentVerified: true, ratingAvg: true, ratingCount: true },
          },
        },
      },
      _count: { select: { proposals: true } },
    },
  });

  if (!job || job.deletedAt) notFound();

  const session = await auth();
  const viewer = session?.user;
  const isOwner = viewer?.id === job.clientId;

  if (viewer && !isOwner && !FREELANCER_ROLES.includes(viewer.role)) {
    redirect('/dashboard');
  }
  const locked = !viewer;
  const canApply =
    !!viewer && !isOwner && FREELANCER_ROLES.includes(viewer.role) && job.status === 'OPEN';
  const alreadyApplied =
    canApply &&
    (await db.proposal.findUnique({
      where: { jobId_freelancerId: { jobId: job.id, freelancerId: viewer!.id } },
      select: { id: true },
    })) !== null;

  const clientPostings = await db.job.count({
    where: { clientId: job.clientId, deletedAt: null },
  });

  const clientLabel =
    job.client.clientProfile?.companyName?.trim() ||
    displayName(job.client.name, job.client.showFullName, '委托方');

  return (
    <div className="container max-w-3xl py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href={isOwner ? '/dashboard' : '/jobs'}>
          <ArrowLeft /> {isOwner ? '返回工作台' : '返回需求大厅'}
        </Link>
      </Button>

      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline">{EXPERIENCE_LABEL[job.experience] ?? job.experience}</Badge>
        <span className="inline-flex items-center gap-1">
          <Users className="size-4" /> {job._count.proposals} 份投标
        </span>
        {job.estimatedDays ? (
          <span className="inline-flex items-center gap-1">
            <Clock className="size-4" /> 约 {job.estimatedDays} 天
          </span>
        ) : null}
      </div>

      <h1 className="text-3xl font-bold">{job.title}</h1>
      <p className="mt-1 text-lg font-semibold text-primary">
        {job.budgetType === 'FIXED'
          ? `${formatMoney(job.budgetMax ?? job.budgetMin ?? 0, job.currency)} 固定价`
          : `${formatMoney(job.budgetMin ?? 0, job.currency)} – ${formatMoney(job.budgetMax ?? 0, job.currency)} / 小时`}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.skills.map((s) => (
          <Badge key={s.skill.id}>{s.skill.name}</Badge>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>需求描述</CardTitle>
        </CardHeader>
        <CardContent>
          {locked ? (
            <div className="relative">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {job.description.slice(0, 400)}
              </p>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-card to-transparent" />
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {job.description}
            </p>
          )}

          {locked ? (
            <div className="mt-4 rounded-lg border bg-muted/40 p-5 text-center">
              <Lock className="mx-auto size-5 text-primary" />
              <p className="mt-2 font-medium">登录后查看完整需求</p>
              <p className="mt-1 text-sm text-muted-foreground">
                服务方免费使用，投标不收取任何费用。
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button asChild>
                  <Link href={`/register?role=freelancer&next=/jobs/${job.slug}`}>免费注册</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/login?next=/jobs/${job.slug}`}>登录</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>关于委托方</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{clientLabel}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {job.client.clientProfile && job.client.clientProfile.ratingCount > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Star className="size-4 fill-primary text-primary" />
                {job.client.clientProfile.ratingAvg.toFixed(1)}（
                {job.client.clientProfile.ratingCount}）
              </span>
            ) : (
              <span>暂无评价</span>
            )}
            <span>{clientPostings} 个需求</span>
          </div>
          {job.client.clientProfile?.paymentVerified ? (
            <Badge variant="secondary" className="mt-2">
              付款已验证
            </Badge>
          ) : null}
        </CardContent>
      </Card>

      {isOwner ? (
        <OwnerApplicants jobId={job.id} slug={job.slug} total={job._count.proposals} />
      ) : (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{alreadyApplied ? '我的投标' : '投标'}</CardTitle>
          </CardHeader>
          <CardContent>
            {alreadyApplied ? (
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-primary" /> 已投标，可在
                <Link href="/dashboard" className="text-primary hover:underline">
                  工作台
                </Link>
                查看进度。
              </p>
            ) : canApply ? (
              <ApplyForm jobId={job.id} defaultBidType={job.budgetType} />
            ) : viewer ? (
              <p className="text-sm text-muted-foreground">
                {job.status === 'OPEN'
                  ? '只有服务方账号可以投标。'
                  : '该需求已停止接收投标。'}
              </p>
            ) : (
              <Button asChild>
                <Link href={`/login?next=/jobs/${job.slug}`}>登录后投标</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

async function OwnerApplicants({
  jobId,
  slug,
  total,
}: {
  jobId: string;
  slug: string;
  total: number;
}) {
  const proposals = await db.proposal.findMany({
    where: { jobId },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      id: true,
      bidAmount: true,
      bidType: true,
      freelancer: {
        select: {
          name: true,
          image: true,
          freelancerProfile: { select: { headline: true, currency: true } },
        },
      },
    },
  });

  return (
    <Card className="mt-6">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>投标</CardTitle>
        {total > 0 ? (
          <Button asChild variant="ghost" size="sm">
            <Link href={`/jobs/${slug}/proposals`}>
              查看全部 {total} <ArrowRight />
            </Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {proposals.length === 0 ? (
          <p className="text-sm text-muted-foreground">还没有投标。</p>
        ) : (
          <ul>
            {proposals.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 border-b border-border py-3 first:pt-0 last:border-0 last:pb-0"
              >
                <Avatar>
                  {p.freelancer.image ? <AvatarImage src={p.freelancer.image} alt="" /> : null}
                  <AvatarFallback>{initials(p.freelancer.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {p.freelancer.name ?? '服务方'}
                  </p>
                  {p.freelancer.freelancerProfile?.headline ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {p.freelancer.freelancerProfile.headline}
                    </p>
                  ) : null}
                </div>
                <Badge variant="outline">
                  {p.bidType === 'HOURLY'
                    ? `${formatMoney(p.bidAmount, p.freelancer.freelancerProfile?.currency ?? 'CNY')}/小时`
                    : formatMoney(p.bidAmount, p.freelancer.freelancerProfile?.currency ?? 'CNY')}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
