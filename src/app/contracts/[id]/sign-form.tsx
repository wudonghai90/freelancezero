'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function SignForm({
  contractId,
  verified,
  realName,
}: {
  contractId: string;
  verified: boolean;
  realName: string;
}) {
  const router = useRouter();
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!verified) {
    return (
      <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
        签署前需要完成实名认证。
        <Link href="/settings/security" className="ml-1 font-medium text-primary hover:underline">
          去认证
        </Link>
      </div>
    );
  }

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/contracts/${contractId}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agree: true }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? '签署失败，请稍后重试');
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-1"
        />
        <span>
          我已阅读并同意以上合同条款，以实名「{realName}」签署。签署记录将包含时间与 IP。
        </span>
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button size="sm" onClick={submit} disabled={!agree || busy}>
        {busy ? '签署中…' : '确认签署'}
      </Button>
    </div>
  );
}
