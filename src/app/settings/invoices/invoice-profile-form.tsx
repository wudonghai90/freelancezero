'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Values = {
  title: string;
  taxNumber: string;
  type: 'NORMAL' | 'VAT_SPECIAL';
  email: string;
  bankName: string;
  bankAccount: string;
  registeredAddress: string;
  registeredPhone: string;
};

export function InvoiceProfileForm({ initial }: { initial: Values }) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch('/api/account/invoice-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? '保存失败，请稍后重试');
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="发票抬头">
          <Input
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="公司或个人名称"
            required
          />
        </Field>
        <Field label="发票类型">
          <select
            value={values.type}
            onChange={(e) => set('type', e.target.value as Values['type'])}
            className="h-9 w-full rounded-md border bg-background px-2 text-sm"
          >
            <option value="NORMAL">增值税普通发票</option>
            <option value="VAT_SPECIAL">增值税专用发票</option>
          </select>
        </Field>
        <Field label="统一社会信用代码 / 税号">
          <Input
            value={values.taxNumber}
            onChange={(e) => set('taxNumber', e.target.value)}
            placeholder="专票必填"
          />
        </Field>
        <Field label="接收邮箱">
          <Input
            type="email"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="用于接收电子发票"
          />
        </Field>
        <Field label="开户银行">
          <Input value={values.bankName} onChange={(e) => set('bankName', e.target.value)} />
        </Field>
        <Field label="银行账号">
          <Input value={values.bankAccount} onChange={(e) => set('bankAccount', e.target.value)} />
        </Field>
        <Field label="注册地址">
          <Input
            value={values.registeredAddress}
            onChange={(e) => set('registeredAddress', e.target.value)}
          />
        </Field>
        <Field label="注册电话">
          <Input
            value={values.registeredPhone}
            onChange={(e) => set('registeredPhone', e.target.value)}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy || values.title.trim().length < 2}>
          {busy ? '保存中…' : '保存'}
        </Button>
        {saved ? <span className="text-sm text-green-600">已保存</span> : null}
        {error ? <span className="text-sm text-destructive">{error}</span> : null}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
