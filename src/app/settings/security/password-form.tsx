'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setDone(false);
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get('newPassword') ?? '');
    const confirm = String(form.get('confirmPassword') ?? '');

    if (newPassword !== confirm) {
      setError('两次输入的新密码不一致');
      return;
    }

    setBusy(true);
    const res = await fetch('/api/account/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(hasPassword ? { currentPassword: String(form.get('currentPassword') ?? '') } : {}),
        newPassword,
      }),
    });
    setBusy(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const details = body?.error?.details?.fieldErrors?.newPassword?.[0];
      setError(details ?? body?.error?.message ?? '密码更新失败');
      return;
    }
    setDone(true);
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {hasPassword ? (
        <div className="grid gap-2">
          <Label htmlFor="currentPassword">当前密码</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          当前账号使用登录链接或第三方登录。设置密码后也可以用密码登录。
        </p>
      )}

      <div className="grid gap-2">
        <Label htmlFor="newPassword">新密码</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        <p className="text-xs text-muted-foreground">
          至少 8 位，包含大小写字母和数字。
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">确认新密码</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {done ? <p className="text-sm text-green-600">密码已更新</p> : null}

      <div>
        <Button type="submit" disabled={busy}>
          {busy ? '保存中…' : hasPassword ? '修改密码' : '设置密码'}
        </Button>
      </div>
    </form>
  );
}
