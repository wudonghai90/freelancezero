import Link from 'next/link';
import { LegalPage, Section, Bullets } from '@/components/legal-page';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'How 自由工作平台 collects, uses, and protects your personal data. We never sell your data, and you can export or delete it at any time.',
  path: '/privacy',
  keywords: ['freelancezero privacy policy', 'freelance platform data protection'],
});

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="We collect the minimum we need to run the marketplace, we never sell your data, and you can take it with you or delete it at any time."
      updated="August 2, 2026"
    >
      <Section heading="Who we are">
        <p>
          自由工作平台 (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates a zero-fee freelance
          marketplace. This policy explains what we do with personal data when you use the hosted
          service at freelancezero.com. 自由工作平台 is also open source and self-hostable — if you
          are using someone else&rsquo;s instance, that operator is the data controller, not us.
        </p>
      </Section>

      <Section heading="What we collect">
        <Bullets
          items={[
            'Account data: name, email address, password hash, and profile photo if you upload one.',
            'Profile data: headline, bio, skills, rates, portfolio items, and work history you choose to publish.',
            'Marketplace activity: job postings, proposals, messages, contracts, and reviews.',
            'Payout preferences: the payment method you select and a display-only identifier (for example a PayPal email). We never take custody of funds and we do not store full bank credentials.',
            'Technical data: IP address, browser user agent, and audit-log entries for security-sensitive actions such as sign-in and payout changes.',
          ]}
        />
      </Section>

      <Section heading="How we use it">
        <Bullets
          items={[
            'To operate the marketplace: matching freelancers with jobs, delivering proposals, and enabling messaging.',
            'To send transactional email: email confirmation, sign-in links, application notifications, and security alerts.',
            'To keep the platform safe: preventing spam, fraud, and abuse, and reviewing accounts before approval.',
            'To meet legal obligations and resolve disputes.',
          ]}
        />
        <p>
          We do not sell your personal data, and we do not use it to train advertising profiles.
        </p>
      </Section>

      <Section heading="Legal bases (GDPR)">
        <p>
          Where the GDPR applies, we process personal data under: performance of a contract (running
          your account and the marketplace), legitimate interests (security, fraud prevention,
          product improvement), consent (optional communications, which you can withdraw), and legal
          obligation (tax and compliance records).
        </p>
      </Section>

      <Section heading="Sharing">
        <p>
          We share data only with processors that make the service work — our hosting provider, our
          database host, and our transactional email provider. They act on our instructions and are
          bound by contract. When you apply to a job, your name, profile, and proposal are shared
          with that client; that is the point of the platform.
        </p>
      </Section>

      <Section heading="Retention">
        <p>
          We keep account data while your account is open. When you delete your account we begin a
          grace period, after which personal data is erased or irreversibly anonymised. Records we
          are legally required to keep (for example, transaction ledgers) are retained for the
          statutory period.
        </p>
      </Section>

      <Section heading="Your rights">
        <Bullets
          items={[
            'Access and export: download your data, including your profile and portfolio.',
            'Rectification: correct anything inaccurate from your settings page.',
            'Erasure: delete your account and associated personal data.',
            'Objection and restriction: ask us to stop specific processing.',
            'Complaint: raise a concern with your local data protection authority.',
          ]}
        />
        <p>
          To exercise any of these, email{' '}
          <a className="text-primary hover:underline" href="mailto:privacy@freelancezero.com">
            privacy@freelancezero.com
          </a>
          .
        </p>
      </Section>

      <Section heading="Cookies">
        <p>
          We use strictly necessary cookies for authentication and security. We do not use
          advertising or cross-site tracking cookies.
        </p>
      </Section>

      <Section heading="Changes">
        <p>
          If we make material changes we will update the date above and, where the change is
          significant, notify you by email. Questions? See our{' '}
          <Link className="text-primary hover:underline" href="/terms">
            Terms
          </Link>{' '}
          and{' '}
          <Link className="text-primary hover:underline" href="/security">
            Security
          </Link>{' '}
          pages.
        </p>
      </Section>
    </LegalPage>
  );
}
