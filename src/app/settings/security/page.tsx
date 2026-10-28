import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowLeft, KeyRound, ShieldCheck, History, CheckCircle2, XCircle, BadgeCheck,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordForm } from './password-form';
import { IdentityCard } from './identity-card';
import { getIdentityAdapter } from '@/lib/adapters/identity';

export const metadata = { title: '安全设置 — OPC' };
export const dynamic = 'force-dynamic';

const ACTION_LABELS: Record<string, string> = {
  'user.password_change': '修改密码',
  'user.login': '登录',
  'job.publish': '发布需求',
  'payment.release': '放款',
  'contract.create': '生成合同',
  'contract.sign': '签署合同',
  'milestone.fund': '托管里程碑',
  'milestone.release': '里程碑放款',
  'identity.manual_submitted': '提交实名认证',
};

export default async function SecuritySettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?next=/settings/security');

  const [user, accounts, recentActivity] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        passwordHash: true, twoFactorEnabled: true, emailVerified: true, email: true,
        identityStatus: true,
      },
    }),
    db.account.findMany({
      where: { userId: session.user.id },
      select: { provider: true },
    }),
    db.auditLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, action: true, createdAt: true, ip: true },
    }),
  ]);
  if (!user) redirect('/login');

  return (
    <div className="container max-w-2xl py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/settings">
          <ArrowLeft /> 设置
        </Link>
      </Button>

      <h1 className="text-3xl font-bold">安全</h1>
      <p className="mt-1 mb-8 text-muted-foreground">
        保护账号安全。重要变更会发送确认邮件。
      </p>

      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <ShieldCheck className="size-5 text-primary" />
          <CardTitle>概览</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <StatusRow
            label="邮箱验证"
            ok={!!user.emailVerified}
            okText={user.email ?? '已验证'}
            badText="尚未验证"
          />
          <StatusRow
            label="密码"
            ok={!!user.passwordHash}
            okText="已设置"
            badText="未设置——使用链接或第三方登录"
          />
          <StatusRow
            label="实名认证"
            ok={user.identityStatus === 'VERIFIED'}
            okText="已认证"
            badText={user.identityStatus === 'UNVERIFIED' ? '未认证' : '审核中'}
          />
          <StatusRow
            label="两步验证"
            ok={user.twoFactorEnabled}
            okText="已开启"
            badText="未开启"
          />
          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="text-muted-foreground">登录方式</span>
            <span className="flex flex-wrap justify-end gap-1">
              {accounts.length === 0 ? (
                <Badge variant="outline">仅邮箱</Badge>
              ) : (
                accounts.map((a) => (
                  <Badge key={a.provider} variant="secondary">
                    {a.provider}
                  </Badge>
                ))
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <KeyRound className="size-5 text-primary" />
          <CardTitle>{user.passwordHash ? '修改密码' : '设置密码'}</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm hasPassword={!!user.passwordHash} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <BadgeCheck className="size-5 text-primary" />
          <CardTitle>实名认证</CardTitle>
        </CardHeader>
        <CardContent>
          <IdentityCard status={user.identityStatus} driver={getIdentityAdapter().driver} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <ShieldCheck className="size-5 text-primary" />
          <CardTitle>两步验证</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {user.twoFactorEnabled
              ? '账号已开启两步验证。'
              : '使用验证器 App 增加登录第二重验证。该功能即将上线，请先使用足够强的独立密码。'}
          </p>
          <Button className="mt-3" size="sm" variant="outline" disabled>
            {user.twoFactorEnabled ? '管理两步验证' : '设置两步验证（即将上线）'}
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <History className="size-5 text-primary" />
          <CardTitle>最近账号活动</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无活动记录。</p>
          ) : (
            <ul className="grid gap-2 text-sm">
              {recentActivity.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 border-b pb-2 last:border-0">
                  <span>{ACTION_LABELS[a.action] ?? a.action}</span>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {a.createdAt.toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusRow({
  label,
  ok,
  okText,
  badText,
}: {
  label: string;
  ok: boolean;
  okText: string;
  badText: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="inline-flex items-center gap-1.5 text-right font-medium">
        {ok ? (
          <CheckCircle2 className="size-4 text-primary" />
        ) : (
          <XCircle className="size-4 text-amber-600" />
        )}
        {ok ? okText : badText}
      </span>
    </div>
  );
}
