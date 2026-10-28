'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Client-side identity: the name freelancers see on postings and messages. */
export function CompanyForm({
  initial,
}: {
  initial: {
    name: string;
    companyName: string;
    companyUrl: string;
    about: string;
    location: string;
  };
}) {
  const router = useRouter();
  const { update } = useSession();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const form = new FormData(e.currentTarget);

    const prefRes = await fetch('/api/account/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: String(form.get('name') ?? '').trim() }),
    });

    const res = await fetch('/api/account/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: String(form.get('companyName') ?? '').trim(),
        companyUrl: String(form.get('companyUrl') ?? '').trim(),
        about: String(form.get('about') ?? '').trim(),
        location: String(form.get('location') ?? '').trim(),
      }),
    });
    setBusy(false);

    if (!res.ok || !prefRes.ok) {
      const body = await (res.ok ? prefRes : res).json().catch(() => null);
      setError(body?.error?.message ?? '保存失败，请检查填写内容后重试。');
      return;
    }
    setSaved(true);
    await update();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="name">你的姓名</Label>
        <Input id="name" name="name" defaultValue={initial.name} maxLength={120} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="companyName">公司名称</Label>
        <Input
          id="companyName"
          name="companyName"
          defaultValue={initial.companyName}
          placeholder="例如：星澜科技"
          maxLength={120}
        />
        <p className="text-xs text-muted-foreground">
          显示在需求与消息中。留空则使用你的姓名。
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="companyUrl">公司网站</Label>
        <Input
          id="companyUrl"
          name="companyUrl"
          type="url"
          defaultValue={initial.companyUrl}
          placeholder="https://yourcompany.com"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="location">所在地</Label>
        <Input
          id="location"
          name="location"
          defaultValue={initial.location}
          placeholder="上海，中国"
          maxLength={120}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="about">公司介绍</Label>
        <textarea
          id="about"
          name="about"
          rows={5}
          defaultValue={initial.about}
          placeholder="介绍公司业务，以及通常招聘哪类人才。"
          className="w-full rounded-md border bg-background p-3 text-sm"
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? '保存中…' : '保存'}
        </Button>
        {saved ? <span className="text-sm text-green-600">已保存</span> : null}
      </div>
    </form>
  );
}
