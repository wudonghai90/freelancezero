import { LegalPage, Section, Bullets } from '@/components/legal-page';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Security',
  description:
    'How 自由工作平台 protects your account and data: encryption in transit, hashed passwords, non-custodial payments, and a public vulnerability disclosure process.',
  path: '/security',
  keywords: ['freelancezero security', 'freelance platform security', 'responsible disclosure'],
});

export default function SecurityPage() {
  return (
    <LegalPage
      title="Security"
      intro="自由工作平台 is open source, which means our security posture is auditable by anyone. Here is how we protect accounts and data — and how to report a problem."
      updated="August 2, 2026"
    >
      <Section heading="Account security">
        <Bullets
          items={[
            'Passwords are hashed with bcrypt (cost factor 12). We never store them in plain text and cannot read them.',
            'Sign in with a password, a one-time email magic link, or Google/GitHub — whichever you prefer.',
            'Optional two-factor authentication (TOTP) is supported; secrets are encrypted at rest.',
            'Email addresses must be confirmed before an account can post jobs or submit proposals.',
            'Security-sensitive changes, such as updating your payout method, trigger a notification email so you notice anything you did not do.',
          ]}
        />
      </Section>

      <Section heading="Data protection">
        <Bullets
          items={[
            'All traffic is served over HTTPS/TLS.',
            'Access to production data is restricted and audited; sensitive actions are written to an append-only audit log.',
            'Uploaded files are validated by type and size and served from a path-traversal-safe route.',
            'We collect the minimum personal data needed to run the marketplace — see our Privacy Policy.',
          ]}
        />
      </Section>

      <Section heading="Payments are non-custodial">
        <p>
          自由工作平台 never holds your money and never takes a commission. Funds move directly
          between client and freelancer through the provider they choose. We store a display-only
          identifier for your chosen payout method (for example a PayPal email) — never full banking
          credentials or card numbers. That means there is no pot of user funds on our side to steal.
        </p>
      </Section>

      <Section heading="Marketplace safety">
        <Bullets
          items={[
            'New accounts are manually reviewed before they can post jobs or apply.',
            'Proposals carry a transparent quality score to keep low-effort spam out of client inboxes.',
            'Outbound email honours one-click unsubscribe and suppression, so we do not become a spam vector.',
            'Reviews are released double-blind to prevent retaliation bias.',
          ]}
        />
      </Section>

      <Section heading="Responsible disclosure">
        <p>
          If you believe you have found a vulnerability, email{' '}
          <a className="text-primary hover:underline" href="mailto:security@freelancezero.com">
            security@freelancezero.com
          </a>{' '}
          with steps to reproduce. Please give us a reasonable window to fix the issue before
          publishing, and avoid accessing other people&rsquo;s data, degrading the service, or
          running automated scans against production while testing.
        </p>
        <p>
          We aim to acknowledge reports within three business days and will keep you updated on the
          fix. We are happy to credit researchers who report responsibly.
        </p>
      </Section>

      <Section heading="Self-hosting">
        <p>
          Running your own instance? You own its security. At minimum: set a strong{' '}
          <code className="rounded bg-muted px-1">AUTH_SECRET</code>, terminate TLS, keep the
          database off the public internet, apply updates promptly, and configure a verified sending
          domain with SPF, DKIM, and DMARC before enabling email.
        </p>
      </Section>
    </LegalPage>
  );
}
