/**
 * RemoteOK source adapter. RemoteOK publishes a public JSON feed at
 * https://remoteok.com/api — the first element is a legal/metadata notice, the
 * rest are postings. We prefer this feed over HTML scraping: it is stable,
 * cheap, and the polite thing to do.
 */
import type { JobScraper, ScrapedJob } from './types';
import { extractEmail, domainFromUrl, cleanDescription, fixMojibake } from './types';

const API_URL = 'https://remoteok.com/api';

// Descriptive UA with a contact URL — we identify ourselves rather than spoof a
// browser. RemoteOK asks scrapers to link back; we do that on the job page.
const USER_AGENT =
  '自由工作平台Bot/1.0 (+https://freelancezero.com/about/crawler)';

interface RemoteOkPosting {
  id?: string;
  slug?: string;
  url?: string;
  apply_url?: string;
  company?: string;
  position?: string;
  description?: string;
  tags?: string[];
  date?: string; // ISO
  salary_min?: number; // major units (USD/yr), when present
  salary_max?: number;
}

export const remoteOkScraper: JobScraper = {
  source: 'REMOTEOK',

  async fetch(): Promise<ScrapedJob[]> {
    const res = await fetch(API_URL, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      // Node fetch honors this; keeps a stuck board from hanging the worker.
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      throw new Error(`RemoteOK feed returned ${res.status}`);
    }

    const raw = (await res.json()) as unknown[];
    const postings = raw.filter(
      (r): r is RemoteOkPosting =>
        typeof r === 'object' && r !== null && 'position' in r && 'id' in r,
    );

    return postings.map((p) => {
      // Emails are extracted from the raw HTML (mailto: hrefs live in markup),
      // but we store the readable text version.
      const rawDescription = p.description ?? '';
      const description = cleanDescription(rawDescription);
      const publishedEmail = extractEmail(rawDescription) ?? extractEmail(p.apply_url);
      return {
        externalId: String(p.id ?? p.slug),
        source: 'REMOTEOK',
        url: p.url ?? `https://remoteok.com/remote-jobs/${p.slug ?? p.id}`,
        applyUrl: p.apply_url || undefined,
        title: fixMojibake(p.position ?? '') || 'Untitled role',
        description,
        companyName: fixMojibake(p.company?.trim() || '') || 'Unknown company',
        companyDomain: domainFromUrl(p.apply_url),
        publishedEmail,
        tags: p.tags ?? [],
        // RemoteOK salaries are annual major units; store as minor units.
        budgetMin: p.salary_min ? Math.round(p.salary_min * 100) : undefined,
        budgetMax: p.salary_max ? Math.round(p.salary_max * 100) : undefined,
        currency: 'USD',
        postedAt: p.date ? new Date(p.date) : undefined,
      } satisfies ScrapedJob;
    });
  },
};
