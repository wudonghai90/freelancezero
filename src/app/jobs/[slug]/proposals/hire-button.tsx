'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function HireButton({ proposalId }: { proposalId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function hire() {
    if (!confirm('录用后将生成合同，其他投标自动关闭。确定继续？')) return;
    setBusy(true);
    setError(null);
    const res = await fetch('/api/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId }),
    });
    const body = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(body?.error?.message ?? '操作失败，请稍后重试');
      return;
    }
    router.push(`/contracts/${body.data.id}`);
  }

  return (
    <div className="mt-3 flex items-center gap-3">
      <Button size="sm" onClick={hire} disabled={busy}>
        {busy ? '生成中…' : '录用并生成合同'}
      </Button>
      {error ? <span className="text-sm text-destructive">{error}</span> : null}
    </div>
  );
}
