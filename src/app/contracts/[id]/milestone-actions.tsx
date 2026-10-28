'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Action = 'FUND' | 'SUBMIT' | 'APPROVE' | 'RELEASE';

export function MilestoneActions({
  contractId,
  milestoneId,
  status,
  signed,
  isClient,
  isFreelancer,
}: {
  contractId: string;
  milestoneId: string;
  status: string;
  signed: boolean;
  isClient: boolean;
  isFreelancer: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  let action: Action | null = null;
  let label = '';
  if (isClient && status === 'PENDING' && signed) {
    action = 'FUND';
    label = '托管资金';
  } else if (isFreelancer && status === 'FUNDED') {
    action = 'SUBMIT';
    label = '提交交付';
  } else if (isClient && status === 'SUBMITTED') {
    action = 'APPROVE';
    label = '验收通过';
  } else if (isClient && status === 'APPROVED') {
    action = 'RELEASE';
    label = '确认放款';
  }

  async function run() {
    if (!action) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/contracts/${contractId}/milestones/${milestoneId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? '操作失败，请稍后重试');
      return;
    }
    router.refresh();
  }

  if (!action) {
    return isClient && status === 'PENDING' && !signed ? (
      <p className="mt-2 text-xs text-muted-foreground">双方签署后才能托管资金。</p>
    ) : null;
  }

  return (
    <div className="mt-3 flex items-center gap-3">
      <Button size="sm" variant={action === 'RELEASE' ? 'default' : 'outline'} onClick={run} disabled={busy}>
        {busy ? '处理中…' : label}
      </Button>
      {error ? <span className="text-sm text-destructive">{error}</span> : null}
    </div>
  );
}
