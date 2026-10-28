import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
  FileSignature,
  FileText,
  Check,
  Search,
  BadgeCheck,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'OPC — 面向中国自由职业者的零抽佣平台',
  description:
    '中文需求、里程碑合同、电子签署与支付宝/微信结算。平台不抽佣，服务方拿到全额，委托方按验收付款。',
  path: '/',
});

const FEATURES = [
  {
    icon: FileSignature,
    title: '中文合同 + 电子签署',
    body: '录用后自动生成中文服务合同，双方以实名在线签署，记录姓名、时间与 IP。',
  },
  {
    icon: Layers,
    title: '里程碑托管与验收',
    body: '按阶段托管、交付、验收、放款。每一步都有记录，避免“做完了不给钱”。',
  },
  {
    icon: Wallet,
    title: '支付宝 / 微信结算',
    body: '绑定支付宝、微信支付或银行卡，款项直达服务方，平台不经手、不抽佣。',
  },
  {
    icon: FileText,
    title: '发票与对账',
    body: '保存默认抬头与税号，按已结算金额申请普票或专票，合同内可追溯。',
  },
  {
    icon: BadgeCheck,
    title: '实名认证',
    body: '签署与收款前需完成实名认证，降低虚假身份与恶意纠纷。',
  },
  {
    icon: ShieldCheck,
    title: '证据链完整',
    body: '需求、投标、合同、交付与结算都在平台留痕，发生争议时有据可查。',
  },
];

const STEPS = [
  {
    icon: Search,
    title: '发布或找到需求',
    body: '委托方用中文描述项目与预算；服务方浏览需求并投标，附报价与周期。',
  },
  {
    icon: FileSignature,
    title: '录用并签署合同',
    body: '委托方选择投标录用，系统生成含里程碑的中文合同，双方实名签署后生效。',
  },
  {
    icon: Layers,
    title: '按里程碑交付结算',
    body: '托管 → 交付 → 验收 → 放款。全部里程碑结算后合同自动完成。',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid-navy [background-size:44px_44px] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-hero-glow" />

        <div className="container relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex animate-fade-up items-center gap-2 rounded-full border border-navy-700 bg-navy-850/70 px-4 py-1.5 text-base text-navy-300 backdrop-blur">
              <Sparkles className="size-4 text-brand-400" />
              为中国市场打造的自由工作平台
            </div>

            <h1 className="mt-6 animate-fade-up font-display text-5xl font-bold heading-tight sm:text-6xl md:text-7xl [animation-delay:60ms]">
              接单、签约、收款
              <br />
              一个平台走完。
            </h1>

            <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-navy-300 [animation-delay:120ms] sm:text-xl">
              中文需求、里程碑合同、实名电子签署、支付宝/微信结算。
              <span className="font-semibold text-white">平台不抽佣</span>
              ，服务方拿到全额，委托方按验收付款。
            </p>

            <div className="mt-8 flex animate-fade-up flex-col items-center justify-center gap-3 [animation-delay:180ms] sm:flex-row">
              <Button asChild size="lg" className="h-12 px-7 text-base shadow-glow">
                <Link href="/register?role=freelancer">
                  开始接单 <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-navy-600 bg-transparent px-7 text-base text-white hover:bg-navy-800 hover:text-white"
              >
                <Link href="/register?role=client">发布需求</Link>
              </Button>
            </div>

            <p className="mt-5 animate-fade-up text-base text-navy-400 [animation-delay:220ms]">
              免费注册 · 无需绑卡 · 两分钟完成资料
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
            {[
              { value: '100%', label: '服务方收入归自己' },
              { value: '0', label: '平台抽佣' },
              { value: 'CNY', label: '人民币结算与发票' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-navy-700/70 bg-navy-900/60 p-5 text-center backdrop-blur"
              >
                <p className="font-display text-3xl font-bold text-white">{s.value}</p>
                <p className="mt-1 text-sm text-navy-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how" className="bg-background py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">核心能力</p>
            <h2 className="mt-3 font-display text-3xl font-bold heading-tight sm:text-4xl">
              不只是发需求，而是把交易闭环做完
            </h2>
            <p className="mt-4 text-muted-foreground">
              从找到人，到签合同、按阶段交付、验收付款、开票，全部在一个平台内完成。
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="h-full">
                <CardContent className="p-6">
                  <f.icon className="size-6 text-primary" />
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="border-y bg-muted/30 py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">怎么运作</p>
            <h2 className="mt-3 font-display text-3xl font-bold heading-tight sm:text-4xl">
              三步完成一次合作
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative rounded-xl border bg-background p-6">
                <span className="absolute right-5 top-5 font-display text-4xl font-bold text-muted-foreground/20">
                  {i + 1}
                </span>
                <s.icon className="size-6 text-primary" />
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">平台规则</p>
          <h2 className="mt-3 font-display text-3xl font-bold heading-tight sm:text-4xl">
            0 抽佣，钱只经过你和对方
          </h2>
          <p className="mt-4 text-muted-foreground">
            平台不参与分成。支付通道收取的手续费由通道方决定，平台不加价。
          </p>
          <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
            {[
              '服务方报价即到手价，平台不扣点',
              '委托方按里程碑验收后付款，不预付全款',
              '合同、签署与结算记录可随时查看',
              '发票抬头与税号一次保存，重复使用',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-lg border p-3 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="trust" className="border-t bg-muted/30 py-24">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-center font-display text-3xl font-bold heading-tight sm:text-4xl">
            常见问题
          </h2>
          <div className="mt-8 grid gap-4">
            {[
              {
                q: '平台真的不收费吗？',
                a: '平台不抽佣、不收会员费。支付通道自身的手续费由通道收取，与平台无关。',
              },
              {
                q: '资金安全怎么保证？',
                a: '资金按里程碑托管，验收通过后才放款。平台记录每一笔状态，双方都能查看。正式接入支付通道前，使用手动记账模式。',
              },
              {
                q: '合同有法律效力吗？',
                a: '双方以实名在平台签署并记录姓名、时间与 IP，形成电子证据。需要 CA 级签署时可切换 e签宝/法大大。',
              },
              {
                q: '可以开发票吗？',
                a: '按已结算金额申请增值税普通发票或专用发票，抬头、税号与邮箱会保存复用。',
              },
            ].map((item) => (
              <div key={item.q} className="rounded-lg border bg-background p-5">
                <h3 className="font-medium">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-navy-950 py-24 text-white">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
        <div className="container relative mx-auto max-w-2xl text-center">
          <Zap className="mx-auto size-8 text-brand-400" />
          <h2 className="mt-5 font-display text-3xl font-bold heading-tight sm:text-4xl">
            把下一单，放在一个能签合同的地方
          </h2>
          <p className="mt-4 text-navy-300">
            免费注册。发布需求或创建资料，几分钟内开始第一次合作。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-7 text-base shadow-glow">
              <Link href="/register?role=freelancer">我是服务方</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-navy-600 bg-transparent px-7 text-base text-white hover:bg-navy-800 hover:text-white"
            >
              <Link href="/register?role=client">我是委托方</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
