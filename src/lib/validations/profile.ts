import { z } from 'zod';

/**
 * Profile validation shared by the settings form and the API.
 *
 * Link fields are checked against their expected host: a "GitHub" field holding
 * a google.com URL is not a typo we should store, it is wrong data that makes
 * the profile look untrustworthy to clients.
 */

/** Accepts a bare domain or a full URL and normalises to https://… */
function normalizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

function hostOf(value: string): string | null {
  const normalized = normalizeUrl(value);
  if (!normalized) return null;
  try {
    return new URL(normalized).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

/**
 * A URL that must live on one of `hosts` (or a subdomain of one).
 * Empty string is allowed and means "clear this field".
 */
function hostedUrl(hosts: string[], label: string) {
  return z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === '' || normalizeUrl(v) !== null, { message: '请输入有效的网址' })
    .refine(
      (v) => {
        if (v === '') return true;
        const host = hostOf(v);
        return !!host && hosts.some((h) => host === h || host.endsWith(`.${h}`));
      },
      { message: `${label} 链接格式不正确（例如 ${hosts[0]}/yourname）` },
    )
    .transform((v) => (v === '' ? '' : (normalizeUrl(v) ?? '')));
}

/** Any valid http(s) URL, or empty to clear. */
const anyUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === '' || normalizeUrl(v) !== null, { message: '请输入有效的网址' })
  .transform((v) => (v === '' ? '' : (normalizeUrl(v) ?? '')));

export const BIO_MIN = 80;
export const BIO_MAX = 2000;

export const profileSchema = z.object({
  headline: z
    .string()
    .trim()
    .min(2, '请填写个人标题（至少 2 个字符）')
    .max(120, '个人标题最多 120 个字符'),
  bio: z
    .string()
    .trim()
    .max(BIO_MAX, `个人简介最多 ${BIO_MAX} 个字符`)
    .refine((v) => v === '' || v.length >= BIO_MIN, {
      message: `个人简介至少 ${BIO_MIN} 个字符，让客户更了解你`,
    }),
  // Required: clients filter on location and ask about timezone overlap first.
  location: z.string().trim().min(2, '请填写所在地').max(120),
  timezone: z.string().trim().max(60).optional(),
  yearsExperience: z.number().int().min(0).max(60).optional(),
  hourlyRate: z.number().int().min(0).max(10000).optional(),
  hoursPerWeek: z.number().int().min(1).max(168).optional(),
  availability: z.enum(['OPEN_TO_WORK', 'OPEN_TO_OFFERS', 'NOT_AVAILABLE']).optional(),

  websiteUrl: anyUrl.optional(),
  githubUrl: hostedUrl(['github.com'], 'GitHub').optional(),
  linkedinUrl: hostedUrl(['linkedin.com'], 'LinkedIn').optional(),
  dribbbleUrl: hostedUrl(['dribbble.com'], 'Dribbble').optional(),
  behanceUrl: hostedUrl(['behance.net'], 'Behance').optional(),
  stackoverflowUrl: hostedUrl(
    ['stackoverflow.com', 'stackexchange.com'],
    'Stack Overflow',
  ).optional(),
  xUrl: hostedUrl(['x.com', 'twitter.com'], 'X / Twitter').optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
