'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PaymentProvider } from '@prisma/client';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type Provider = PaymentProvider;

// 国内默认收款方式：支付宝、微信、银行卡。MANUAL 用于线下/对公转账记账。
const METHODS: {
  provider: Provider;
  label: string;
  desc: string;
  placeholder: string;
  needHolder: boolean;
}[] = [
  {
    provider: 'ALIPAY',
    label: '支付宝',
    desc: '绑定支付宝账号，客户结算后直接到账。',
    placeholder: '支付宝账号或绑定手机号',
    needHolder: true,
  },
  {
    provider: 'WECHAT_PAY',
    label: '微信支付',
    desc: '绑定微信号，适合小额与个人结算。',
    placeholder: '微信号或绑定手机号',
    needHolder: true,
  },
  {
    provider: 'BANK_TRANSFER',
    label: '银行卡转账',
    desc: '填写本人银行卡，适合大额与对公结算。',
    placeholder: '银行卡号',
    needHolder: true,
  },
  {
    provider: 'MANUAL',
    label: '线下 / 发票结算',
    desc: '与客户线下约定付款方式，平台仅记账。',
    placeholder: '备注（可选）',
    needHolder: true,
  },
];

export function PayoutMethods({
  initialProvider,
  initialDetail,
  initialHolderName,
  isFreelancer,
}: {
  initialProvider: string | null;
  initialDetail: string | null;
  initialHolderName: string | null;
  isFreelancer: boolean;
}) {
  const router = useRouter();
  const [connected, setConnected] = useState<Provider | null>(
    (initialProvider as Provider | null) ?? null,
  );
  const [detail, setDetail] = useState<string | null>(initialDetail);
  const [holderName, setHolderName] = useState<string | null>(initialHolderName);
  const [openFor, setOpenFor] = useState<Provider | null>(null);
  const [input, setInput] = useState('');
  const [holderInput, setHolderInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function notifyChanged() {
    window.dispatchEvent(new Event('payout:changed'));
    router.refresh();
  }

  async function connect(provider: Provider) {
    setBusy(true);
    setError(null);
    const res = await fetch('/api/account/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        detail: input.trim() || undefined,
        holderName: holderInput.trim() || undefined,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? '保存失败，请稍后重试');
      return;
    }
    setConnected(provider);
    setDetail(input.trim() || null);
    setHolderName(holderInput.trim() || null);
    setOpenFor(null);
    setInput('');
    setHolderInput('');
    notifyChanged();
  }

  async function remove() {
    setBusy(true);
    const res = await fetch('/api/account/payout', { method: 'DELETE' });
    setBusy(false);
    if (res.ok) {
      setConnected(null);
      setDetail(null);
      setHolderName(null);
      notifyChanged();
    }
  }

  return (
    <div className="grid gap-3">
      {METHODS.map((m) => {
        const isConnected = connected === m.provider;
        return (
          <div key={m.provider} className="rounded-lg border p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{m.label}</p>
                  {isConnected ? (
                    <Badge variant="secondary" className="gap-1">
                      <Check className="size-3" /> 已绑定
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isConnected && detail
                    ? holderName
                      ? `${holderName} · ${detail}`
                      : detail
                    : m.desc}
                </p>
              </div>
              {isConnected ? (
                <Button variant="outline" size="sm" onClick={remove} disabled={busy}>
                  移除
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    setOpenFor(openFor === m.provider ? null : m.provider);
                    setInput('');
                    setError(null);
                  }}
                  disabled={busy}
                >
                  {openFor === m.provider ? '取消' : '绑定'}
                </Button>
              )}
            </div>

            {openFor === m.provider ? (
              <div className="mt-3 grid gap-2">
                {m.needHolder ? (
                  <Input
                    value={holderInput}
                    onChange={(e) => setHolderInput(e.target.value)}
                    placeholder="开户人真实姓名（必填）"
                    autoComplete="name"
                  />
                ) : null}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={m.placeholder}
                    className="sm:flex-1"
                  />
                  <Button onClick={() => connect(m.provider)} disabled={busy}>
                    {busy ? '保存中…' : '保存'}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <p className="text-sm text-muted-foreground">
        {isFreelancer
          ? '客户通过你选择的方式直接付款，平台不经手资金、不抽佣。'
          : '你通过选择的方式直接付款给服务方，平台不经手资金、不抽佣。'}
      </p>
    </div>
  );
}
