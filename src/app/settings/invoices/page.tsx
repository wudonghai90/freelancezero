import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatMoney } from '@/lib/utils';
import { INVOICE_STATUS_LABEL } from '@/lib/contracts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoiceProfileForm } from './invoice-profile-form';

export const metadata = { title: '发票信息 — OPC' };
export const dynamic = 'force-dynamic';

export default async function InvoiceSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?next=/settings/invoices');

  const [profile, invoices] = await Promise.all([
    db.invoiceProfile.findUnique({ where: { userId: session.user.id } }),
    db.invoice.findMany({
      where: { applicantId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        amount: true,
        currency: true,
        type: true,
        status: true,
        title: true,
        contractId: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="container max-w-2xl py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/settings">
          <ArrowLeft /> 设置
        </Link>
      </Button>

      <div className="flex items-center gap-3">
        <FileText className="size-6 text-primary" />
        <h1 className="text-3xl font-bold">发票信息</h1>
      </div>
      <p className="mt-1 text-muted-foreground">
        保存默认抬头，合同结算后可直接申请开票。实际开票由服务方按平台记录线下完成。
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">默认开票信息</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceProfileForm
            initial={{
              title: profile?.title ?? '',
              taxNumber: profile?.taxNumber ?? '',
              type: profile?.type ?? 'NORMAL',
              email: profile?.email ?? '',
              bankName: profile?.bankName ?? '',
              bankAccount: profile?.bankAccount ?? '',
              registeredAddress: profile?.registeredAddress ?? '',
              registeredPhone: profile?.registeredPhone ?? '',
            }}
          />
        </CardContent>
      </Card>

      <h2 className="mt-10 text-lg font-semibold">开票申请</h2>
      {invoices.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">还没有开票申请。</p>
      ) : (
        <div className="mt-3 space-y-2">
          {invoices.map((inv) => (
            <Link key={inv.id} href={`/contracts/${inv.contractId}`} className="block">
              <Card className="transition-colors hover:border-primary/40">
                <CardContent className="flex flex-wrap items-center gap-2 py-3 text-sm">
                  <span className="font-medium">{inv.title}</span>
                  <Badge variant="outline">
                    {INVOICE_STATUS_LABEL[inv.status] ?? inv.status}
                  </Badge>
                  <span className="text-muted-foreground">
                    {inv.type === 'VAT_SPECIAL' ? '专票' : '普票'}
                  </span>
                  <span className="ml-auto">{formatMoney(inv.amount, inv.currency, 'zh-CN')}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(inv.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
