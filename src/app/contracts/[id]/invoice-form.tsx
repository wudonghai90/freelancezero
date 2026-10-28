'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function InvoiceForm({
  contractId,
  defaultTitle,
  defaultTaxNumber,
  defaultEmail,
}: {
  contractId: string;
  defaultTitle: string;
  defaultTaxNumber: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'NORMAL' | 'VAT_SPECIAL'>('NORMAL');
  const [title, setTitle] = useState(defaultTitle);
  const [taxNumber, setTaxNumber] = useState(defaultTaxNumber);
  const [email, setEmail] = useState(defaultEmail);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/contracts/${contractId}/invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, title, taxNumber, email }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? '提交失败，请稍后重试');
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        申请开票
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-md border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">发票类型</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'NORMAL' | 'VAT_SPECIAL')}
            className="h-9 w-full rounded-md border bg-background px-2"
          >
            <option value="NORMAL">增值税普通发票</option>
            <option value="VAT_SPECIAL">增值税专用发票</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">发票抬头</span>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">税号</span>
          <Input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">接收邮箱</span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="用于接收电子发票"
          />
        </label>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={busy || title.trim().length < 2}>
          {busy ? '提交中…' : '提交申请'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          取消
        </Button>
      </div>
    </form>
  );
}
