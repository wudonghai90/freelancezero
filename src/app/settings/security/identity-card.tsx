'use client';

import { useState } from 'react';
import { BadgeCheck, ShieldQuestion, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type Status = 'UNVERIFIED' | 'PENDING' | 'PROCESSING' | 'VERIFIED' | 'FAILED';
type Driver = 'none' | 'manual' | 'stripe';

const COPY: Record<Status, { label: string; desc: string; Icon: typeof BadgeCheck }> = {
  UNVERIFIED: {
    label: '未认证',
    desc: '完成实名认证后，合同与发票可以使用真实姓名，也更容易获得对方信任。',
    Icon: ShieldQuestion,
  },
  PENDING: {
    label: '审核中',
    desc: '已提交实名信息，等待管理员核对；通过后会显示已认证。',
    Icon: Clock,
  },
  PROCESSING: {
    label: '审核中',
    desc: '认证机构正在审核，请耐心等待。',
    Icon: Clock,
  },
  VERIFIED: {
    label: '已认证',
    desc: '实名信息已确认，可用于签署合同和开具发票。',
    Icon: BadgeCheck,
  },
  FAILED: {
    label: '未通过',
    desc: '本次认证未通过，可以重新提交。',
    Icon: XCircle,
  },
};

export function IdentityCard({ status, driver }: { status: Status; driver: Driver }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realName, setRealName] = useState('');
  const { label, desc, Icon } = COPY[status];

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch('/api/account/identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: driver === 'manual' ? JSON.stringify({ realName }) : undefined,
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? '提交失败，请稍后重试');
      return;
    }
    const { data } = await res.json();
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
    // 人工认证：页面刷新后显示“审核中”。
    window.location.reload();
  }

  const canStart =
    driver !== 'none' && status !== 'VERIFIED' && status !== 'PROCESSING' && status !== 'PENDING';

  return (
    <div>
      <div className="flex items-start gap-3">
        <Icon
          className={`mt-0.5 size-5 shrink-0 ${
            status === 'VERIFIED'
              ? 'text-primary'
              : status === 'FAILED'
                ? 'text-destructive'
                : 'text-muted-foreground'
          }`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">实名认证</span>
            <Badge variant={status === 'VERIFIED' ? 'secondary' : 'outline'}>{label}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>

      {driver === 'manual' && canStart ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            placeholder="请输入真实姓名（与证件一致）"
            maxLength={40}
            className="sm:flex-1"
          />
          <Button size="sm" onClick={submit} disabled={busy || realName.trim().length < 2}>
            {busy ? '提交中…' : status === 'FAILED' ? '重新提交' : '提交实名认证'}
          </Button>
        </div>
      ) : null}

      {driver === 'stripe' && canStart ? (
        <Button size="sm" className="mt-3" onClick={submit} disabled={busy}>
          {busy ? '正在启动…' : status === 'FAILED' ? '重试' : '开始认证'}
        </Button>
      ) : null}

      {driver === 'none' ? (
        <p className="mt-3 text-xs text-muted-foreground">
          本实例未启用实名认证。设置 <code className="rounded bg-muted px-1">IDENTITY_DRIVER=manual</code> 开启人工审核。
        </p>
      ) : null}

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <p className="mt-3 text-xs text-muted-foreground">
        {driver === 'manual'
          ? '人工认证只保存真实姓名，不收集证件号码；合同签署时会记录时间与 IP。'
          : '认证由第三方服务完成，平台只保存认证结果，不保存证件影像或号码。'}
      </p>
    </div>
  );
}
