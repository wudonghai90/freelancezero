import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Wallet, ShieldCheck, User, Bell, ChevronRight, FileText } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AvatarUpload } from '@/components/avatar-upload';

export const metadata = { title: '设置 — OPC' };
export const dynamic = 'force-dynamic';

const FREELANCER_ROLES = ['FREELANCER', 'AGENCY_OWNER', 'AGENCY_MEMBER'];

const ROLE_LABEL: Record<string, string> = {
  CLIENT: '委托方',
  FREELANCER: '服务方',
  AGENCY_OWNER: '工作室负责人',
  AGENCY_MEMBER: '工作室成员',
  ADMIN: '管理员',
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?next=/settings');

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      twoFactorEnabled: true,
      passwordHash: true,
      showFullName: true,
    },
  });
  if (!user) redirect('/login');

  const isFreelancer = FREELANCER_ROLES.includes(user.role);
  const memberSince = user.createdAt.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-3xl font-bold">设置</h1>
      <p className="mt-1 mb-8 text-muted-foreground">管理账号、收款、发票与安全设置。</p>

      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <User className="size-5 text-primary" />
          <CardTitle>账号</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div className="border-b pb-4">
            <AvatarUpload image={user.image} name={user.name} email={user.email} />
          </div>
          <Row label="姓名" value={user.name ?? '—'} />
          <Row label="邮箱" value={user.email} />
          <Row
            label="账号类型"
            value={<Badge variant="secondary">{ROLE_LABEL[user.role] ?? user.role}</Badge>}
          />
          <Row label="加入时间" value={memberSince} />
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4">
        <LinkCard
          href="/settings/profile"
          icon={User}
          title={isFreelancer ? '公开资料' : '企业资料'}
          desc={
            isFreelancer
              ? '标题、简介、报价与可接单状态——客户看到的内容。'
              : '公司名称、网址与介绍——服务方看到的内容。'
          }
        />
        <LinkCard
          href="/settings/payments"
          icon={Wallet}
          title={isFreelancer ? '收款方式' : '付款方式'}
          desc={
            isFreelancer
              ? '绑定支付宝、微信或银行卡，平台不抽佣。'
              : '选择向服务方付款的方式，平台不抽佣。'
          }
        />
        <LinkCard
          href="/settings/invoices"
          icon={FileText}
          title="发票信息"
          desc="保存默认抬头、税号与接收邮箱，合同结算后可直接申请开票。"
        />
        <LinkCard
          href="/settings/notifications"
          icon={Bell}
          title="通知与隐私"
          desc={`邮件通知偏好 · 公开姓名显示为${user.showFullName ? '全名' : '姓氏 + 首字母'}。`}
        />
        <LinkCard
          href="/settings/security"
          icon={ShieldCheck}
          title="安全"
          desc={`密码${user.passwordHash ? '已设置' : '未设置'} · 两步验证${user.twoFactorEnabled ? '已开启' : '未开启'}。`}
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function LinkCard({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="transition-colors hover:border-primary">
        <CardContent className="flex items-center gap-4 py-4">
          <Icon className="size-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
