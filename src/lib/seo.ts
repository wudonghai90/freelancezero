import type { Metadata } from 'next';

/**
 * Centralized SEO. One place controls titles, descriptions, canonical URLs,
 * Open Graph, Twitter cards, and structured data (JSON-LD). Every page should
 * build its metadata from here so we stay consistent and keyword-disciplined.
 *
 * Primary target keywords (see docs/GO-TO-MARKET.md for the full map):
 *   "Upwork alternative", "zero fee freelance platform",
 *   "freelance marketplace no commission", "no fee freelance website".
 */
export const SITE = {
  name: '自由工作平台',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://freelancezero.com',
  // Title-tag positioning line — keyword-first, benefit-second.
  tagline: 'The Zero-Fee Upwork Alternative',
  description:
    '自由工作平台 is the zero-fee alternative to Upwork. Freelancers keep 100% of what they earn — no commissions, no connects. Clients hire top talent faster and pay directly. Free forever.',
  twitter: '@freelancezero',
  keywords: [
    'Upwork alternative',
    'zero fee freelance platform',
    'freelance marketplace no commission',
    'no fee freelance website',
    'freelance platform no fees',
    'hire freelancers no commission',
    'freelance jobs',
    'freelance marketplace 2026',
  ],
} as const;

interface PageMetaInput {
  title: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
}

/** Build a full Metadata object for a page with canonical + social tags. */
export function pageMetadata({
  title,
  description = SITE.description,
  path = '/',
  keywords = [],
  noIndex = false,
}: PageMetaInput): Metadata {
  const url = new URL(path, SITE.url).toString();
  return {
    title,
    description,
    keywords: [...SITE.keywords, ...keywords],
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE.name,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE.twitter,
      title,
      description,
    },
  };
}

/* --------------------------------------------------------------------------
 * JSON-LD structured data. Rendered as <script type="application/ld+json">.
 * Rich results (FAQ, org sitelinks, breadcrumbs) are a major organic-CTR lever.
 * -------------------------------------------------------------------------- */

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  sameAs: [
    'https://twitter.com/freelancezero',
    'https://github.com/freelancezero/freelancezero',
    'https://www.linkedin.com/company/freelancezero',
  ],
};

/** WebSite + Sitelinks Search Box, so Google can surface an in-site search box. */
export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE.url}/jobs?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

/** Serialize JSON-LD safely for embedding in a <script> tag. */
export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}
