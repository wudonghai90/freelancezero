'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type BudgetType = 'FIXED' | 'HOURLY';
type Experience = 'ENTRY' | 'INTERMEDIATE' | 'EXPERT';

const toMinor = (major: string): number | undefined => {
  const n = parseFloat(major);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : undefined;
};

/** Client-side post-a-job form. Amounts are entered in major units. */
export function JobForm() {
  const router = useRouter();
  const [budgetType, setBudgetType] = useState<BudgetType>('FIXED');
  const [experience, setExperience] = useState<Experience>('INTERMEDIATE');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    const min = toMinor(String(form.get('budgetMin') ?? ''));
    const max = toMinor(String(form.get('budgetMax') ?? ''));
    const days = parseInt(String(form.get('estimatedDays') ?? ''), 10);

    const payload = {
      title: String(form.get('title') ?? '').trim(),
      description: String(form.get('description') ?? '').trim(),
      budgetType,
      budgetMin: budgetType === 'FIXED' ? (max ?? min) : min,
      budgetMax: budgetType === 'FIXED' ? (max ?? min) : max,
      experience,
      estimatedDays: Number.isFinite(days) && days > 0 ? days : undefined,
      skillIds: [] as string[],
    };

    setLoading(true);
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error?.message ?? '发布失败，请检查填写内容后重试。');
      return;
    }
    const { data } = await res.json();
    router.push(`/jobs/${data.slug}/proposals`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="title">需求标题</Label>
        <Input
          id="title"
          name="title"
          required
          minLength={8}
          maxLength={120}
          placeholder="例如：为数据看板招募资深前端工程师"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">需求描述</Label>
        <textarea
          id="description"
          name="description"
          required
          minLength={40}
          rows={8}
          placeholder="要做什么、技术栈、时间节点，以及你希望服务方具备什么经验（至少 40 字）。"
          className="w-full rounded-md border bg-background p-3 text-sm"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="budgetType">预算方式</Label>
          <select
            id="budgetType"
            value={budgetType}
            onChange={(e) => setBudgetType(e.target.value as BudgetType)}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="FIXED">固定总价</option>
            <option value="HOURLY">按小时</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="experience">经验要求</Label>
          <select
            id="experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value as Experience)}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="ENTRY">入门</option>
            <option value="INTERMEDIATE">中级</option>
            <option value="EXPERT">专家</option>
          </select>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {budgetType === 'FIXED' ? (
          <div className="grid gap-2">
            <Label htmlFor="budgetMax">总价（元）</Label>
            <Input
              id="budgetMax"
              name="budgetMax"
              type="number"
              min="1"
              step="1"
              placeholder="30000"
            />
          </div>
        ) : (
          <>
            <div className="grid gap-2">
              <Label htmlFor="budgetMin">最低时薪（元/小时）</Label>
              <Input
                id="budgetMin"
                name="budgetMin"
                type="number"
                min="1"
                step="1"
                placeholder="300"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budgetMax">最高时薪（元/小时）</Label>
              <Input
                id="budgetMax"
                name="budgetMax"
                type="number"
                min="1"
                step="1"
                placeholder="600"
              />
            </div>
          </>
        )}
        <div className="grid gap-2">
          <Label htmlFor="estimatedDays">预计天数（可选）</Label>
          <Input
            id="estimatedDays"
            name="estimatedDays"
            type="number"
            min="1"
            step="1"
            placeholder="30"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div>
        <Button type="submit" disabled={loading}>
          {loading ? '发布中…' : '发布需求'}
        </Button>
      </div>
    </form>
  );
}
