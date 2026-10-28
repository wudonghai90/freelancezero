import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { formatMoney } from '@/lib/utils';
import {
  CONTRACT_STATUS_LABEL,
  INVOICE_STATUS_LABEL,
  MILESTONE_STATUS_LABEL,
} from '@/lib/contracts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SignForm } from './sign-form';
import { MilestoneActions } from './milestone-actions';
import { InvoiceForm } from './invoice-form';

export const metadata = { title: '合同详情 — OPC' };
export const dynamic = 'force-dynamic';

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) redirect(`/login?next=/contracts/${id}`);

  const contract = await db.contract.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      status: true,
      currency: true,
      clientId: true,
      freelancerId: true,
      clientSignedAt: true,
      freelancerSignedAt: true,
      createdAt: true,
      client: { select: { name: true, realName: true, image: true } },
      freelancer: { select: { name: true, realName: true, image: true } },
      job: { select: { slug: true } },
      signatures: {
        select: { party: true, status: true, signerName: true, signedAt: true, provider: true },
      },
      milestones: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          amount: true,
          status: true,
          dueAt: true,
          payment: { select: { provider: true, status: true, paidAt: true } },
        },
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          currency: true,
          type: true,
          status: true,
          title: true,
          createdAt: true,
        },
      },
    },
  });

  if (!contract) notFound();

  const isClient = contract.clientId === session.user.id;
  const isFreelancer = contract.freelancerId === session.user.id;
  if (!isClient && !isFreelancer) notFound();

  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { realName: true, identityStatus: true },
  });
  const mySignature = contract.signatures.find(
    (s) => s.party === (isClient ? 'CLIENT' : 'FREELANCER'),
  );
  const bothSigned = !!contract.clientSignedAt && !!contract.freelancerSignedAt;
  const total = contract.milestones.reduce((sum, m) => sum + m.amount, 0);
  const released = contract.milestones
    .filter((m) => m.status === 'RELEASED')
    .reduce((sum, m) => sum + m.amount, 0);
  const profile = await db.invoiceProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="container max-w-3xl py-12">
      <p className="text-sm text-muted-foreground">
        <Link href="/contracts" className="hover:underline">
          合同
        </Link>{' '}
        / {contract.job.slug}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">{contract.title}</h1>
        <Badge variant={contract.status === 'COMPLETED' ? 'secondary' : 'outline'}>
          {CONTRACT_STATUS_LABEL[contract.status] ?? contract.status}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        委托方：{contract.client.realName ?? contract.client.name ?? '—'} · 服务方：
        {contract.freelancer.realName ?? contract.freelancer.name ?? '—'} · 合同金额：
        {formatMoney(total, contract.currency, 'zh-CN')}
      </p>

      {/* 签署 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">签署</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {contract.signatures.map((s) => (
              <div key={s.party} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{s.party === 'CLIENT' ? '委托方' : '服务方'}</p>
                <p className="mt-1 text-muted-foreground">
                  {s.status === 'SIGNED' ? `已签署 · ${s.signerName}` : '待签署'}
                </p>
                {s.signedAt ? (
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.signedAt).toLocaleString('zh-CN')}
                    {s.provider === 'manual' ? ' · 站内签署' : ''}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          {mySignature?.status !== 'SIGNED' && contract.status === 'ACTIVE' ? (
            <SignForm
              contractId={contract.id}
              verified={me?.identityStatus === 'VERIFIED' && !!me.realName}
              realName={me?.realName ?? ''}
            />
          ) : null}
          {bothSigned ? (
            <p className="text-sm text-green-600">合同已生效，可以按里程碑推进。</p>
          ) : null}
        </CardContent>
      </Card>

      {/* 里程碑 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">里程碑</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {contract.milestones.map((m, i) => (
            <div key={m.id} className="rounded-md border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">
                  {i + 1}. {m.title}
                </span>
                <Badge variant={m.status === 'RELEASED' ? 'secondary' : 'outline'}>
                  {MILESTONE_STATUS_LABEL[m.status] ?? m.status}
                </Badge>
                <span className="ml-auto font-medium">
                  {formatMoney(m.amount, contract.currency, 'zh-CN')}
                </span>
              </div>
              {m.dueAt ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  截止 {new Date(m.dueAt).toLocaleDateString('zh-CN')}
                </p>
              ) : null}
              <MilestoneActions
                contractId={contract.id}
                milestoneId={m.id}
                status={m.status}
                signed={bothSigned}
                isClient={isClient}
                isFreelancer={isFreelancer}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 发票 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">发票</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            可开票金额：{formatMoney(released, contract.currency, 'zh-CN')}（按已结算里程碑累计）
          </p>
          {contract.invoices.length > 0 ? (
            <div className="space-y-2">
              {contract.invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-wrap items-center gap-2 rounded-md border p-3 text-sm"
                >
                  <span className="font-medium">{inv.title}</span>
                  <Badge variant="outline">
                    {INVOICE_STATUS_LABEL[inv.status] ?? inv.status}
                  </Badge>
                  <span className="text-muted-foreground">
                    {inv.type === 'VAT_SPECIAL' ? '增值税专用发票' : '增值税普通发票'}
                  </span>
                  <span className="ml-auto">
                    {formatMoney(inv.amount, inv.currency, 'zh-CN')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">还没有开票申请。</p>
          )}

          {isClient && released > 0 ? (
            <InvoiceForm
              contractId={contract.id}
              defaultTitle={profile?.title ?? ''}
              defaultTaxNumber={profile?.taxNumber ?? ''}
              defaultEmail={profile?.email ?? ''}
            />
          ) : null}
        </CardContent>
      </Card>

      <div className="my-8 border-t" />

      {/* 合同正文 */}
      <h2 className="mb-3 text-lg font-semibold">合同正文</h2>
      <div className="rounded-md border bg-muted/30 p-5">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {contract.content ?? '（合同正文缺失）'}
        </pre>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        合同生成于 {new Date(contract.createdAt).toLocaleString('zh-CN')}。
      </p>
    </div>
  );
}
