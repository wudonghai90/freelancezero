import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Wallet,
  Star,
  Search,
  TrendingUp,
  CheckCircle2,
  Circle,
} from 'lucide-react';

/**
 * High-fidelity product mockups rendered as real markup (not images). They
 * carry the "this is a polished, shipping product" signal on the marketing page
 * and stay crisp on any display. All are static server components.
 */

function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-float ring-1 ring-black/5">
      <div className="flex items-center gap-2 border-b border-black/5 bg-slate-50 px-4 py-2.5">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <div className="mx-auto flex items-center gap-2 rounded-md bg-white px-3 py-1 text-xs text-slate-400 ring-1 ring-black/5">
          <span className="size-2 rounded-full bg-brand-500" />
          {url}
        </div>
      </div>
      {children}
    </div>
  );
}

const SIDEBAR = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Briefcase, label: 'Contracts' },
  { icon: MessageSquare, label: 'Messages' },
  { icon: Wallet, label: 'Payments' },
];

/** The hero "money shot": a freelancer earnings dashboard. */
export function DashboardMockup() {
  return (
    <BrowserFrame url="freelancezero.com/dashboard">
      <div className="flex bg-white text-slate-900">
        {/* Sidebar */}
        <aside className="hidden w-44 shrink-0 flex-col gap-1 border-r border-black/5 bg-slate-50/80 p-3 sm:flex">
          <div className="mb-3 flex items-center gap-2 px-2 py-1 text-sm font-bold">
            <span className="grid size-6 place-items-center rounded-md bg-primary text-white">Fz</span>
            自由工作平台
          </div>
          {SIDEBAR.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm ${
                item.active ? 'bg-primary/10 font-medium text-primary' : 'text-slate-500'
              }`}
            >
              <item.icon className="size-4" />
              {item.label}
            </div>
          ))}
        </aside>

        {/* Main */}
        <div className="flex-1 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Good morning, Jordan</p>
              <h3 className="text-lg font-bold">Your earnings</h3>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-500">
              <Search className="size-3.5" /> Search…
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-black/5 bg-white p-3 shadow-sm">
              <p className="text-[11px] text-slate-400">Available balance</p>
              <p className="mt-1 text-xl font-bold tracking-tight">$12,480</p>
              <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-brand-600">
                <TrendingUp className="size-3" /> 100% yours
              </p>
            </div>
            <div className="rounded-xl border border-black/5 bg-white p-3 shadow-sm">
              <p className="text-[11px] text-slate-400">This month</p>
              <p className="mt-1 text-xl font-bold tracking-tight">$4,200</p>
              <p className="mt-1 text-[11px] text-slate-400">+18% vs last</p>
            </div>
            <div className="rounded-xl border border-black/5 bg-white p-3 shadow-sm">
              <p className="text-[11px] text-slate-400">Fees paid</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-brand-600">$0.00</p>
              <p className="mt-1 text-[11px] text-slate-400">Always</p>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-4 rounded-xl border border-black/5 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Income</p>
              <span className="text-[11px] text-slate-400">Last 6 months</span>
            </div>
            <AreaChart />
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

/** Hand-built smooth area chart — no dependency, always sharp. */
function AreaChart() {
  return (
    <svg viewBox="0 0 320 90" className="h-24 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2e5bf0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2e5bf0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,70 C30,60 45,40 70,44 C100,49 115,20 150,26 C185,32 200,12 240,18 C275,23 295,8 320,10 L320,90 L0,90 Z"
        fill="url(#areaFill)"
      />
      <path
        d="M0,70 C30,60 45,40 70,44 C100,49 115,20 150,26 C185,32 200,12 240,18 C275,23 295,8 320,10"
        fill="none"
        stroke="#2e5bf0"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Job feed card used in the feature section. */
export function JobFeedMockup() {
  const jobs = [
    { title: 'Senior React engineer', budget: '$85–110/hr', tags: ['React', 'Next.js'], match: 96 },
    { title: 'Brand & landing page design', budget: '$4,500 fixed', tags: ['Figma', 'UI'], match: 91 },
    { title: 'Technical SEO audit', budget: '$2,000 fixed', tags: ['SEO'], match: 88 },
  ];
  return (
    <BrowserFrame url="freelancezero.com/jobs">
      <div className="space-y-2.5 bg-white p-4 text-slate-900">
        {jobs.map((job) => (
          <div key={job.title} className="rounded-xl border border-black/5 p-3 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold">{job.title}</p>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                {job.match}% match
              </span>
            </div>
            <p className="mt-0.5 text-xs font-medium text-primary">{job.budget}</p>
            <div className="mt-2 flex gap-1.5">
              {job.tags.map((t) => (
                <span key={t} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </BrowserFrame>
  );
}

/** Freelancer profile card used in the feature section. */
export function ProfileMockup() {
  return (
    <BrowserFrame url="freelancezero.com/jordan-dev">
      <div className="bg-white p-4 text-slate-900">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-bold text-white">
            JD
          </div>
          <div>
            <p className="text-sm font-bold">Jordan Dev</p>
            <p className="text-xs text-slate-400">Senior Full-Stack Engineer</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-amber-500">
              <Star className="size-3 fill-amber-400 text-amber-400" /> 4.9 · 47 reviews
            </p>
          </div>
          <span className="ml-auto rounded-full bg-brand-50 px-2 py-1 text-[10px] font-semibold text-brand-700">
            Open to work
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['TypeScript', 'React', 'Next.js', 'Node', 'AWS'].map((s) => (
            <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
              {s}
            </span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            ['$85', '/hour'],
            ['100%', 'job success'],
            ['24h', 'response'],
          ].map(([a, b]) => (
            <div key={b} className="rounded-lg bg-slate-50 py-2">
              <p className="text-sm font-bold">{a}</p>
              <p className="text-[10px] text-slate-400">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

/** Contract / milestone view used in the feature section. */
export function ProposalMockup() {
  const milestones = [
    { label: 'Design system & wireframes', amount: '$1,200', done: true },
    { label: 'Core build & integration', amount: '$2,000', done: true },
    { label: 'QA, launch & handoff', amount: '$1,300', done: false },
  ];
  return (
    <BrowserFrame url="freelancezero.com/contracts/482">
      <div className="bg-white p-4 text-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold">Marketing site build</p>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
            Active
          </span>
        </div>
        <div className="space-y-2">
          {milestones.map((m) => (
            <div key={m.label} className="flex items-center gap-2.5 rounded-lg border border-black/5 p-2.5">
              {m.done ? (
                <CheckCircle2 className="size-4 shrink-0 text-brand-500" />
              ) : (
                <Circle className="size-4 shrink-0 text-slate-300" />
              )}
              <span className="text-xs">{m.label}</span>
              <span className="ml-auto text-xs font-semibold">{m.amount}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-brand-50 p-2.5">
          <span className="text-xs font-medium text-brand-700">Released to you</span>
          <span className="text-sm font-bold text-brand-700">$3,200 · 0% fee</span>
        </div>
      </div>
    </BrowserFrame>
  );
}
