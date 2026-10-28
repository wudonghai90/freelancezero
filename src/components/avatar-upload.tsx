'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { initials } from '@/lib/utils';

/**
 * Profile photo with inline replace. After a successful upload the JWT session
 * is refreshed (`update()`) so the navbar avatar changes without a re-login.
 */
export function AvatarUpload({
  image,
  name,
  email,
}: {
  image: string | null;
  name: string | null;
  email: string | null;
}) {
  const router = useRouter();
  const { update } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(file: File | null) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    setError(null);

    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/account/avatar', { method: 'POST', body: form });
    setBusy(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? '上传失败，请换一张图片试试');
      setPreview(null);
      return;
    }
    await update();
    router.refresh();
  }

  const src = preview ?? image;

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        {src ? <AvatarImage src={src} alt="" /> : null}
        <AvatarFallback className="text-lg">{initials(name, email)}</AvatarFallback>
      </Avatar>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <Camera /> {busy ? '上传中…' : image ? '更换头像' : '添加头像'}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">支持 PNG、JPG、WebP，最大 2 MB。</p>
        {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
