import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { formatMoney } from '@/lib/utils';
import { CONTRACT_STATUS_LABEL } from '@/lib/contracts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const metadata = { title: '合同 — OPC' };
export const dynamic = 'force-dynamic';

export default async function ContractsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?next=/contracts');

  const contracts = await db.contract.findMany({
    where: {
      OR: [{ clientId: session.user.id }, { freelancerId: session.user.id }],
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      status: true,
      currency: true,
      clientId: true,
      clientSignedAt: true,
      freelancerSignedAt: true,
      client: { select: { name: true, image: true } },
      freelancer: { select: { name: true, image: true } },
      milestones: { select: { amount: true, status: true } },
      createdAt: true,
    },
  });

  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold">合同</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        录用后自动生成合同，双方签署并完成里程碑结算。
      </p>

      {contracts.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            还没有合同。收到投标后，在需求页的投标列表中选择“录用并生成合同”。
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-3">
          {contracts.map((c) => {
            const isClient = c.clientId === session.user.id;
            const other = isClient ? c.freelancer : c.client;
            const total = c.milestones.reduce((sum, m) => sum + m.amount, 0);
            const done = c.milestones.filter((m) => m.status === 'RELEASED').length;
            const signed = !!c.clientSignedAt && !!c.freelancerSignedAt;

            return (
              <Link key={c.id} href={`/contracts/${c.id}`} className="block">
                <Card className="transition-colors hover:border-primary/40">
                  <CardContent className="flex items-center gap-4 py-4">
                    <Avatar>
                      {other.image ? <AvatarImage src={other.image} alt="" /> : null}
                      <AvatarFallback>{(other.name ?? '?').slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium">{c.title}</span>
                        <Badge variant={c.status === 'COMPLETED' ? 'secondary' : 'outline'}>
                          {CONTRACT_STATUS_LABEL[c.status] ?? c.status}
                        </Badge>
                        {!signed && c.status === 'ACTIVE' ? (
                          <Badge variant="outline" className="border-amber-500/50 text-amber-600">
                            待签署
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {isClient ? '服务方' : '委托方'}：{other.name ?? '未命名'} · 里程碑 {done}/
                        {c.milestones.length} 已结算
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatMoney(total, c.currency, 'zh-CN')}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
