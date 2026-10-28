'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Site-wide warning shown to signed-in users who haven't set up a payment /
 * payout method. Fetches per-user state client-side so the root layout can stay
 * static; renders nothing for guests or users who already have a method.
 */
export function PayoutBanner() {
  const { status } = useSession();
  const pathname = usePathname();
  const [needsMethod, setNeedsMethod] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const check = useCallback(async () => {
    if (status !== 'authenticated') return;
    try {
      const res = await fetch('/api/account/payout');
      if (!res.ok) return;
      const { data } = await res.json();
      setNeedsMethod(!data?.provider);
    } catch {
      /* ignore — a transient failure just hides the banner */
    }
  }, [status]);

  useEffect(() => {
    check();
    // Re-check when the payments page saves/removes a method.
    const onChange = () => check();
    window.addEventListener('payout:changed', onChange);
    return () => window.removeEventListener('payout:changed', onChange);
  }, [check]);

  // Don't nag on the page where they'd fix it.
  const onPaymentsPage = pathname?.startsWith('/settings/payments');
  if (status !== 'authenticated' || needsMethod !== true || dismissed || onPaymentsPage) {
    return null;
  }

  return (
    <div className="border-b border-amber-500/40 bg-amber-500/10">
      <div className="container flex items-center gap-3 py-2 text-sm">
        <AlertTriangle className="size-4 shrink-0 text-amber-600" />
        <p className="flex-1">
          你还没有设置收款方式。{' '}
          <Link href="/settings/payments" className="font-medium underline underline-offset-2">
            立即添加
          </Link>{' '}
          以便接收款项。
        </p>
        <button
          onClick={() => setDismissed(true)}
          aria-label="关闭"
          className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
