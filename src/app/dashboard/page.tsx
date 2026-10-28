import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Briefcase, FileText, Star, Wallet, Plus, Search, FileSignature, Activity, ArrowRight, TrendingUp, Users2,
  ShieldCheck, Check,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatMoney, initials, displayName } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { OnboardingSteps } from '@/components/onboarding-steps';
import { getOnboarding } from '@/lib/onboarding';
import { missingItems } from '@/lib/profile-completeness';

export const metadata = { title: '工作台 — OPC' };
export const dynamic = 'force-dynamic';

const FREELANCER_ROLES = ['FREELANCER', 'AGENCY_OWNER', 'AGENCY_MEMBER'];

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  SUBMITTED: 'secondary', SHORTLISTED: 'default', ACCEPTED: 'default',
  REJECTED: 'outline', WITHDRAWN: 'outline',
};

const PROPOSAL_STATUS_LABEL: Record<string, string> = {
  SUBMITTED: '已投递',
  SHORTLISTED: '已入围',
  ACCEPTED: '已录用',
  REJECTED: '未录用',
  WITHDRAWN: '已撤回',
};

const JOB_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  OPEN: '招募中',
  IN_PROGRESS: '进行中',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?next=/dashboard');

  const userId = session.user.id;
  const isFreelancer = FREELANCER_ROLES.includes(session.user.role);

  // Required onboarding: until the self-serve steps are done, the wizard is
  // the only page that matters.
  const onboarding = await getOnboarding(userId, session.user.role);
  if (session.user.role !== 'ADMIN' && !onboarding.actionableComplete) {
    redirect('/onboarding');
  }

  // One round-trip of aggregates + the money figure (real released funds).
  const [proposalsSent, jobsPosted, applicantsTotal, activeContracts, reviews, released] =
    await Promise.all([
      db.proposal.count({ where: { freelancerId: userId } }),
      db.job.count({ where: { clientId: userId, deletedAt: null } }),
      db.proposal.count({ where: { job: { clientId: userId } } }),
      db.contract.count({
        where: isFreelancer
          ? { freelancerId: userId, status: 'ACTIVE' }
          : { clientId: userId, status: 'ACTIVE' },
      }),
      db.review.count({ where: { targetId: userId, visible: true } }),
      db.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'RELEASED',
          milestone: { contract: isFreelancer ? { freelancerId: userId } : { clientId: userId } },
        },
      }),
    ]);
  const money = released._sum.amount ?? 0;

  const stats = isFreelancer
    ? [
        { label: '已投递', value: proposalsSent, icon: FileText },
        { label: '进行中的合同', value: activeContracts, icon: FileSignature },
        { label: '累计收入', value: formatMoney(money, 'CNY'), icon: Wallet },
        { label: '评价', value: reviews, icon: Star },
      ]
    : [
        { label: '已发布需求', value: jobsPosted, icon: Briefcase },
        { label: '收到投标', value: applicantsTotal, icon: FileText },
        { label: '进行中的合同', value: activeContracts, icon: FileSignature },
        { label: '累计支出', value: formatMoney(money, 'CNY'), icon: Wallet },
      ];

  return (
    <div className="container py-12">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">工作台</h1>
          <Badge variant="secondary">{session.user.role.toLowerCase().replace('_', ' ')}</Badge>
        </div>
        <Button asChild>
          <Link href={isFreelancer ? '/jobs' : '/jobs/new'}>
            {isFreelancer ? <Search /> : <Plus />} {isFreelancer ? '去接单' : '发布需求'}
          </Link>
        </Button>
      </div>
      <p className="mb-8 text-muted-foreground">
        欢迎回来，{session.user.name ?? session.user.email}。
      </p>

      {session.user.role !== 'ADMIN' ? (
        <OnboardingSteps steps={onboarding.steps} currentIndex={onboarding.currentIndex} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isFreelancer ? <FreelancerProposals userId={userId} /> : <ClientJobs userId={userId} />}
        </div>
        <aside className="space-y-6">
          {session.user.role === 'ADMIN' ? (
            <AdminReviewCard />
          ) : isFreelancer ? (
            <ProfileCompleteness userId={userId} />
          ) : (
            <DiscoverFreelancers />
          )}
          <AccountSecurity userId={userId} isFreelancer={isFreelancer} />
          <GetPaidCard isFreelancer={isFreelancer} money={money} />
          <RecentActivity userId={userId} />
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------- main column ------------------------------ */

async function ClientJobs({ userId }: { userId: string }) {
  const jobs = await db.job.findMany({
    where: { clientId: userId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 25,
    select: {
      id: true, title: true, slug: true, status: true,
      budgetType: true, budgetMin: true, budgetMax: true, currency: true,
      _count: { select: { proposals: true } },
    },
  });

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">我的需求</h2>
        <Button asChild variant="ghost" size="sm"><Link href="/jobs/new"><Plus /> 发布</Link></Button>
      </div>
      {jobs.length === 0 ? (
        <EmptyState text="还没有发布需求。" cta="发布第一个需求" href="/jobs/new" icon={Plus} />
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.slug}`} className="block">
              <Card className="transition-colors hover:border-primary">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.budgetType === 'FIXED'
                        ? `${formatMoney(job.budgetMax ?? job.budgetMin ?? 0, job.currency)} 固定价`
                        : `${formatMoney(job.budgetMin ?? 0, job.currency)}–${formatMoney(job.budgetMax ?? 0, job.currency)}/小时`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 whitespace-nowrap">
                    <Badge variant="outline">{JOB_STATUS_LABEL[job.status] ?? job.status}</Badge>
                    <span className="text-sm font-medium">
                      {job._count.proposals} 份投标
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

async function FreelancerProposals({ userId }: { userId: string }) {
  const proposals = await db.proposal.findMany({
    where: { freelancerId: userId },
    orderBy: { createdAt: 'desc' },
    take: 25,
    select: {
      id: true, status: true, bidAmount: true, bidType: true,
      job: { select: { title: true, slug: true } },
    },
  });

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">我的投标</h2>
        <Button asChild variant="ghost" size="sm"><Link href="/jobs"><Search /> 浏览</Link></Button>
      </div>
      {proposals.length === 0 ? (
        <EmptyState text="还没有投标。" cta="浏览开放需求" href="/jobs" icon={Search} />
      ) : (
        <div className="grid gap-3">
          {proposals.map((p) => (
            <Link key={p.id} href={`/jobs/${p.job.slug}`} className="block">
              <Card className="transition-colors hover:border-primary">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      报价：{formatMoney(p.bidAmount, 'CNY')}{p.bidType === 'HOURLY' ? '/小时' : ' 固定价'}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[p.status] ?? 'secondary'}>
                    {PROPOSAL_STATUS_LABEL[p.status] ?? p.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/* --------------------------------- aside ---------------------------------- */

async function ProfileCompleteness({ userId }: { userId: string }) {
  const profile = await db.freelancerProfile.findUnique({
    where: { userId },
    select: {
      completenessScore: true,
      headline: true,
      bio: true,
      location: true,
      hourlyRate: true,
      yearsExperience: true,
      timezone: true,
      websiteUrl: true,
      githubUrl: true,
      linkedinUrl: true,
      dribbbleUrl: true,
      behanceUrl: true,
      stackoverflowUrl: true,
      xUrl: true,
      user: { select: { image: true } },
      _count: { select: { skills: true, portfolioItems: true } },
    },
  });
  const score = profile?.completenessScore ?? 0;

  // Show what is actually missing — a bare percentage tells nobody what to do.
  const todo = profile
    ? missingItems({
        headline: profile.headline,
        bio: profile.bio,
        location: profile.location,
        hourlyRate: profile.hourlyRate,
        yearsExperience: profile.yearsExperience,
        timezone: profile.timezone,
        image: profile.user.image,
        skillCount: profile._count.skills,
        portfolioCount: profile._count.portfolioItems,
        linkCount: [
          profile.websiteUrl, profile.githubUrl, profile.linkedinUrl,
          profile.dribbbleUrl, profile.behanceUrl, profile.stackoverflowUrl, profile.xUrl,
        ].filter(Boolean).length,
      }).slice(0, 3)
    : [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="size-4 text-primary" /> 资料完整度
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">完成度</span>
          <span className="font-semibold">{score}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${score}%` }} />
        </div>
        {score < 100 ? (
          <>
            {todo.length ? (
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {todo.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            <Link
              href="/settings/profile"
              className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              完善资料 <ArrowRight className="size-3.5" />
            </Link>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">资料已完善。</p>
        )}
      </CardContent>
    </Card>
  );
}

/** Client-only: a peek at top talent, linking to the full freelancer directory. */
async function DiscoverFreelancers() {
  const rows = await db.freelancerProfile.findMany({
    where: { user: { status: 'ACTIVE', deletedAt: null } },
    orderBy: [{ ratingAvg: 'desc' }, { completenessScore: 'desc' }],
    take: 3,
    select: {
      id: true,
      headline: true,
      ratingAvg: true,
      ratingCount: true,
      user: { select: { name: true, image: true, showFullName: true } },
    },
  });

  // Public name only — the legal name must not reach the serialized payload.
  const freelancers = rows.map(({ user, ...rest }) => ({
    ...rest,
    publicName: displayName(user.name, user.showFullName),
    avatarInitials: initials(user.name),
    image: user.image,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users2 className="size-4 text-primary" /> 推荐服务方
        </CardTitle>
      </CardHeader>
      <CardContent>
        {freelancers.length === 0 ? (
          <p className="text-sm text-muted-foreground">还没有服务方资料。</p>
        ) : (
          <>
            <ul className="space-y-1">
              {freelancers.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/freelancers/${f.id}`}
                    className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent"
                  >
                    <Avatar>
                      {f.image ? <AvatarImage src={f.image} alt="" /> : null}
                      <AvatarFallback>{f.avatarInitials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{f.publicName}</p>
                      {f.headline ? (
                        <p className="truncate text-xs text-muted-foreground">{f.headline}</p>
                      ) : null}
                    </div>
                    {f.ratingCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="size-3.5 fill-primary text-primary" />{' '}
                        {f.ratingAvg.toFixed(1)}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Deliberately no "browse all" link: the full talent index is not
                exposed, so the roster cannot be enumerated or scraped. */}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/** Admin-only: pending account approvals with a link to the review queue. */
async function AdminReviewCard() {
  const pending = await db.user.count({
    where: { approvedAt: null, emailVerified: { not: null }, deletedAt: null },
  });
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4 text-primary" /> 管理员审核
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {pending === 0 ? '没有待审核账号。' : `${pending} 个账号等待审核。`}
        </p>
        <Button asChild size="sm" variant="outline" className="mt-3">
          <Link href="/admin/approvals">去审核</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/** Trust posture at a glance — verification, 2FA, password, and payment setup. */
async function AccountSecurity({ userId, isFreelancer }: { userId: string; isFreelancer: boolean }) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true, twoFactorEnabled: true, passwordHash: true, payoutProvider: true },
  });

  const rows = [
    { label: '邮箱验证', ok: !!user?.emailVerified, on: '已验证', off: '未验证' },
    { label: '两步验证', ok: !!user?.twoFactorEnabled, on: '已开启', off: '未开启' },
    { label: '密码', ok: !!user?.passwordHash, on: '已设置', off: '未设置' },
    {
      label: isFreelancer ? '收款方式' : '付款方式',
      ok: !!user?.payoutProvider,
      on: '已设置',
      off: '未设置',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4 text-primary" /> 账号与安全
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">{r.label}</span>
              {r.ok ? (
                <span className="inline-flex items-center gap-1 font-medium text-primary">
                  <Check className="size-3.5" /> {r.on}
                </span>
              ) : (
                <span className="text-muted-foreground">{r.off}</span>
              )}
            </li>
          ))}
        </ul>
        <Button asChild size="sm" variant="outline" className="mt-3">
          <Link href="/settings">管理账号</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function GetPaidCard({ isFreelancer, money }: { isFreelancer: boolean; money: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="size-4 text-primary" /> {isFreelancer ? '收款' : '付款'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {money > 0
            ? `${formatMoney(money, 'CNY')} ${isFreelancer ? '已收入' : '已支出'} — 平台 0 抽佣。`
            : isFreelancer
              ? '绑定收款方式，客户结算后直接到账。'
              : '选择付款方式，直接付给服务方，平台不抽佣。'}
        </p>
        <Button asChild size="sm" variant="outline" className="mt-3">
          <Link href="/settings/payments">{isFreelancer ? '设置收款' : '付款设置'}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

async function RecentActivity({ userId }: { userId: string }) {
  const items = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 6,
    select: { id: true, title: true, body: true, href: true, readAt: true, createdAt: true },
  });
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="size-4 text-primary" /> 最近动态
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无动态。</p>
        ) : (
          <ul className="space-y-3">
            {items.map((n) => {
              const inner = (
                <>
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                  {n.body ? <p className="truncate text-xs text-muted-foreground">{n.body}</p> : null}
                  <p className="text-xs text-muted-foreground">
                    {n.createdAt.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  </p>
                </>
              );
              return (
                <li key={n.id} className="flex gap-2">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.readAt ? 'bg-muted-foreground/30' : 'bg-primary'}`} />
                  <div className="min-w-0">
                    {n.href ? <Link href={n.href} className="hover:underline">{inner}</Link> : inner}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({
  text, cta, href, icon: Icon,
}: {
  text: string; cta: string; href: string; icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-muted-foreground">{text}</p>
        <Button asChild><Link href={href}><Icon className="size-4" /> {cta}</Link></Button>
      </CardContent>
    </Card>
  );
}
