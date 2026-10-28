import { cn } from '@/lib/utils';

/**
 * The 自由工作平台 brand mark: a bold "0" (zero fees, zero commission) cut by
 * a rising slash — earnings break through and go up. Royal-blue → teal
 * gradient. The slash's gap is a true mask knockout, so the mark works on any
 * background.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fz-mark-lg" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2E5BF0" />
          <stop offset="1" stopColor="#1CB6C9" />
        </linearGradient>
        <mask id="fz-mark-cut">
          <rect width="32" height="32" fill="#fff" />
          <path d="M3.5 27.5 L27.5 6.5" stroke="#000" strokeWidth="3.4" strokeLinecap="round" />
        </mask>
      </defs>
      <rect
        x="8.4"
        y="8.2"
        width="15.2"
        height="17.6"
        rx="6.2"
        fill="none"
        stroke="url(#fz-mark-lg)"
        strokeWidth="5.6"
        mask="url(#fz-mark-cut)"
      />
      <path d="M3.5 27.5 L27.5 6.5" stroke="url(#fz-mark-lg)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Full lockup: mark + Chinese wordmark with brand-blue "工作平台". */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2 font-display text-3xl font-bold tracking-tight', className)}>
      <LogoMark className="size-8" />
      <span>
        自由<span className="text-[#2E5BF0]">工作平台</span>
      </span>
    </span>
  );
}
