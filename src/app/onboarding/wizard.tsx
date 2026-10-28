'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowRight, PartyPopper, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stepper } from '@/components/stepper';
import { ResendVerificationButton } from '@/components/resend-verification-button';
import { PayoutMethods } from '@/app/settings/payments/payout-methods';
import type { OnboardingStep } from '@/lib/onboarding';

type Props = {
  steps: OnboardingStep[];
  currentIndex: number;
  complete: boolean;
  isFreelancer: boolean;
  email: string;
  initialHeadline: string;
  initialLocation: string;
  payout: {
    provider: 'STRIPE_CONNECT' | 'PAYPAL' | 'WISE' | 'MANUAL' | 'CRYPTO_USDC' | null;
    detail: string | null;
    holderName: string | null;
  };
};

/**
 * The required onboarding wizard. The current step always derives from
 * server state (router.refresh() re-computes it after every action), so the
 * flow resumes exactly where the user left off — even across sessions.
 */
export function OnboardingWizard(props: Props) {
  const router = useRouter();
  const { steps, currentIndex, complete } = props;

  // Everything self-serve is done; only the admin review remains (or all done).
  const onlyApprovalLeft = currentIndex === steps.length - 1;
  const current = currentIndex >= 0 ? steps[currentIndex] : null;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">
          {complete ? '全部完成' : '完成账号设置'}
        </CardTitle>
        <Stepper steps={steps} currentIndex={currentIndex} />
      </CardHeader>
      <CardContent>
        {complete ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <PartyPopper className="size-10 text-primary" />
            <p className="text-muted-foreground">
              账号已设置完成并通过审核，开始使用吧。
            </p>
            <Button asChild className="mt-2">
              <Link href="/dashboard">
                进入工作台 <ArrowRight />
              </Link>
            </Button>
          </div>
        ) : onlyApprovalLeft ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Clock className="size-10 text-amber-600" />
            <p className="font-medium">账号正在审核中</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              你这边已完成，接下来由管理员审核。通常一天内完成，通过后会邮件通知你。
            </p>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" onClick={() => router.refresh()}>
                查看状态
              </Button>
              <Button asChild variant="ghost">
                <Link href="/">先逛逛平台</Link>
              </Button>
            </div>
          </div>
        ) : current?.id === 'email' ? (
          <EmailStep email={props.email} />
        ) : current?.id === 'photo' ? (
          <PhotoStep />
        ) : current?.id === 'profile' ? (
          <ProfileStep
            headline={props.initialHeadline}
            location={props.initialLocation}
          />
        ) : current?.id === 'payout' ? (
          <PayoutStep payout={props.payout} />
        ) : null}
      </CardContent>
    </Card>
  );
}

/* --------------------------------- steps --------------------------------- */

function EmailStep({ email }: { email: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <p className="font-medium">验证你的邮箱</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        我们已向 <span className="font-medium">{email}</span>{' '}
        发送验证链接。点击邮件中的链接后，回到这里继续。
      </p>
      <p className="text-sm text-muted-foreground">
        没收到邮件？<ResendVerificationButton />
      </p>
      <Button onClick={() => router.refresh()} className="mt-2">
        我已完成验证，继续 <ArrowRight />
      </Button>
    </div>
  );
}

function PhotoStep() {
  const router = useRouter();
  const { update } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload() {
    if (!file) {
      setError('请先选择图片');
      return;
    }
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/account/avatar', { method: 'POST', body: form });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? '上传失败，请换一张图片试试');
      return;
    }
    // Re-sync the JWT session so the new photo shows in the navbar immediately.
    await update();
    router.refresh();
  }

  return (
    <div className="grid gap-4 py-2">
      <div>
        <p className="font-medium">上传头像</p>
        <p className="text-sm text-muted-foreground">
          客户和服务方都能看到。支持 PNG / JPG / WebP，最大 2 MB。
        </p>
      </div>
      <div className="flex items-center gap-4">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="头像预览" className="size-16 rounded-full object-cover" />
        ) : null}
        <Input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="cursor-pointer"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            setError(null);
            setPreview(f ? URL.createObjectURL(f) : null);
          }}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button onClick={upload} disabled={busy} className="w-fit">
        {busy ? '上传中…' : '上传并继续'} <ArrowRight />
      </Button>
    </div>
  );
}

function ProfileStep({
  headline,
  location,
}: {
  headline: string;
  location: string;
}) {
  const router = useRouter();
  const [headlineInput, setHeadlineInput] = useState(headline);
  const [locationInput, setLocationInput] = useState(location);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    const res = await fetch('/api/account/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headline: headlineInput.trim(),
        location: locationInput.trim(),
        bio: '',
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const flat = body?.error?.details?.fieldErrors as Record<string, string[]> | undefined;
      const first = flat ? Object.values(flat)[0]?.[0] : undefined;
      setError(first ?? body?.error?.message ?? '保存失败，请重试。');
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid gap-4 py-2">
      <div>
        <p className="font-medium">基本信息</p>
        <p className="text-sm text-muted-foreground">
          用一句话介绍你的专长和所在地，客户会按这两项筛选。
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="headline">个人标题</Label>
        <Input
          id="headline"
          value={headlineInput}
          onChange={(e) => setHeadlineInput(e.target.value)}
          placeholder="资深全栈工程师"
          maxLength={120}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location">所在地</Label>
        <Input
          id="location"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          placeholder="上海，中国"
          maxLength={120}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button onClick={save} disabled={busy || headlineInput.trim().length < 2 || locationInput.trim().length < 2} className="w-fit">
        {busy ? '保存中…' : '保存并继续'} <ArrowRight />
      </Button>
    </div>
  );
}

function PayoutStep({ payout }: { payout: Props['payout'] }) {
  const router = useRouter();
  return (
    <div className="grid gap-4 py-2">
      <div>
        <p className="font-medium">添加付款方式</p>
        <p className="text-sm text-muted-foreground">
          直接向服务人才付款，平台零抽佣。
        </p>
      </div>
      <PayoutMethods
        initialProvider={payout.provider}
        initialDetail={payout.detail}
        initialHolderName={payout.holderName}
        isFreelancer={false}
      />
      <Button onClick={() => router.refresh()} className="w-fit">
        继续 <ArrowRight />
      </Button>
    </div>
  );
}
