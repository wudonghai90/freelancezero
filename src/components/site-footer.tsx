import Link from 'next/link';
import { Logo } from '@/components/logo';

const COLUMNS = [
  {
    title: '服务方',
    links: [
      { label: '浏览需求', href: '/jobs' },
      { label: '创建资料', href: '/register?role=freelancer' },
      { label: '收款方式', href: '/settings/payments' },
      { label: '合同与签署', href: '/contracts' },
    ],
  },
  {
    title: '委托方',
    links: [
      { label: '发布需求', href: '/register?role=client' },
      { label: '如何付款', href: '/#how' },
      { label: '发票信息', href: '/settings/invoices' },
    ],
  },
  {
    title: '平台',
    links: [
      { label: '关于我们', href: '/blog' },
      { label: '平台规则', href: '/#pricing' },
      { label: '信任与安全', href: '/#trust' },
    ],
  },
  {
    title: '资源',
    links: [
      { label: '帮助中心', href: '/blog' },
      { label: '开源项目', href: 'https://github.com/freelancezero/freelancezero' },
      { label: '服务状态', href: '/status' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-navy-700/40 bg-navy-950 text-navy-300">
      <div className="container grid gap-12 py-16 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="max-w-xs">
          <Link href="/" aria-label="返回首页">
            <Logo className="text-white" />
          </Link>
          <p className="mt-4 text-sm leading-relaxed">
            面向中国市场的自由工作平台：中文需求、里程碑合同、支付宝/微信结算，平台不抽佣。
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-white">{col.title}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-navy-800">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 text-xs text-navy-400 sm:flex-row">
          <p>© {new Date().getFullYear()} OPC · 为中国自由职业者而建</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white">
              隐私政策
            </Link>
            <Link href="/terms" className="hover:text-white">
              服务条款
            </Link>
            <Link href="/security" className="hover:text-white">
              安全
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
