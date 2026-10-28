'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const toMinor = (major: string): number | undefined => {
  const n = parseFloat(major);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : undefined;
};

/** Inline apply form shown to eligible freelancers on the job page. */
export function ApplyForm({
  jobId,
  defaultBidType,
}: {
  jobId: string;
  defaultBidType: 'FIXED' | 'HOURLY';
}) {
  const router = useRouter();
  const [bidType, setBidType] = useState<'FIXED' | 'HOURLY'>(defaultBidType);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const bid = toMinor(String(form.get('bidAmount') ?? ''));
    const days = parseInt(String(form.get('estimatedDays') ?? ''), 10);

    if (!bid) {
      setError('请输入报价金额。');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId,
        coverLetter: String(form.get('coverLetter') ?? '').trim(),
        bidAmount: bid,
        bidType,
        estimatedDays: Number.isFinite(days) && days > 0 ? days : undefined,
        milestones: [],
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error?.message ?? '投标失败，请稍后重试。');
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="coverLetter">投标说明</Label>
        <textarea
          id="coverLetter"
          name="coverLetter"
          required
          minLength={40}
          rows={6}
          placeholder="说明你的相关经验、实现方案与可投入时间（至少 40 字）。"
          className="w-full rounded-md border bg-background p-3 text-sm"
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="bidType">报价方式</Label>
          <select
            id="bidType"
            value={bidType}
            onChange={(e) => setBidType(e.target.value as 'FIXED' | 'HOURLY')}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="FIXED">固定总价</option>
            <option value="HOURLY">按小时</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bidAmount">{bidType === 'HOURLY' ? '时薪（元）' : '总价（元）'}</Label>
          <Input
            id="bidAmount"
            name="bidAmount"
            type="number"
            min="1"
            step="1"
            required
            placeholder="6000"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="estimatedDays">预计天数（可选）</Label>
          <Input
            id="estimatedDays"
            name="estimatedDays"
            type="number"
            min="1"
            step="1"
            placeholder="21"
          />
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div>
        <Button type="submit" disabled={loading}>
          {loading ? '提交中…' : '提交投标'}
        </Button>
      </div>
    </form>
  );
}
