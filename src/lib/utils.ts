import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names, resolving conflicts (e.g. `p-2 p-4` -> `p-4`).
 * The canonical shadcn/ui helper.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an integer amount of minor currency units (cents) for display.
 * Money is ALWAYS stored as integer minor units; formatting happens only here.
 */
export function formatMoney(minorUnits: number, currency = 'CNY', locale = 'zh-CN') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(minorUnits / 100);
}

/**
 * Public-facing name. Marketplace profiles are public pages, so by default we
 * abbreviate the surname ("Jordan Diaz" -> "Jordan D.") to keep a profile from
 * becoming a people-search result. Users can opt into their full name from
 * settings (User.showFullName).
 */
export function displayName(
  name: string | null | undefined,
  showFullName: boolean | undefined,
  fallback = 'Freelancer',
): string {
  const trimmed = name?.trim();
  if (!trimmed) return fallback;
  if (showFullName) return trimmed;

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0]!;
  // Keep given name(s), abbreviate only the surname.
  const last = parts[parts.length - 1]!;
  return `${parts.slice(0, -1).join(' ')} ${last[0]!.toUpperCase()}.`;
}

/** Two-letter initials from a name (or email) for avatar fallbacks. */
export function initials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0]![0]! + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  return (email?.[0] ?? 'U').toUpperCase();
}

/** Build a URL-safe slug from arbitrary text. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}
