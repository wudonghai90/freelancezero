import { notFound, redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { initials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ApproveButton } from './approve-button';

export const metadata = { title: '账号审核' };
export const dynamic = 'force-dynamic';

/**
 * Admin review queue — accounts that finished every self-serve onboarding
 * step (crucially: confirmed email) and are waiting for manual approval.
 */
export default async function ApprovalsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?next=/admin/approvals');
  if (session.user.role !== 'ADMIN') notFound();

  const pending = await db.user.findMany({
    where: { approvedAt: null, emailVerified: { not: null }, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    take: 50,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      autoReviewStatus: true,
      autoReviewScore: true,
      autoReviewReason: true,
      clientProfile: { select: { companyName: true } },
      freelancerProfile: { select: { headline: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">账号审核</h2>
        <Badge variant="secondary">{pending.length} 个待审核</Badge>
      </div>
      <p className="mt-1 text-muted-foreground">
        AI 会自动通过无明显异常的账号；标记为“建议复核”或 AI 不可用的账号在这里人工处理。
      </p>

      {pending.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-8 text-center text-muted-foreground">
            暂无待审核账号。
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-3">
          {pending.map((u) => (
            <Card key={u.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <Avatar>
                  {u.image ? <AvatarImage src={u.image} alt="" /> : null}
                  <AvatarFallback>{initials(u.name, u.email)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{u.name ?? u.email}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {u.clientProfile?.companyName ?? u.freelancerProfile?.headline ?? u.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    注册于 {u.createdAt.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  </p>
                  {u.autoReviewReason ? (
                    <p className="mt-1 text-xs text-amber-600">
                      AI：{u.autoReviewReason}
                      {u.autoReviewScore != null ? `（风险 ${u.autoReviewScore}）` : ''}
                    </p>
                  ) : null}
                </div>
                {u.autoReviewStatus === 'FLAGGED' ? (
                  <Badge variant="outline" className="border-amber-500 text-amber-600">
                    AI 建议复核
                  </Badge>
                ) : u.autoReviewStatus === 'FAILED' ? (
                  <Badge variant="outline">AI 不可用</Badge>
                ) : null}
                <Badge variant="outline">{u.role.toLowerCase().replace('_', ' ')}</Badge>
                <ApproveButton userId={u.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
