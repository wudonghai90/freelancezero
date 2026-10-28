import Link from 'next/link';
import { LegalPage, Section, Bullets } from '@/components/legal-page';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Terms of Service',
  description:
    'The terms that govern your use of 自由工作平台 — the zero-fee freelance marketplace. Plain language, no hidden commissions.',
  path: '/terms',
  keywords: ['freelancezero terms of service', 'freelance marketplace terms'],
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="The rules for using 自由工作平台. We have tried to keep them short and readable, because terms nobody reads protect nobody."
      updated="August 2, 2026"
    >
      <Section heading="1. Agreement">
        <p>
          By creating an account or using 自由工作平台 you agree to these Terms. If you are using
          the platform on behalf of a company, you confirm you are authorised to bind that company.
          If you do not agree, do not use the service.
        </p>
      </Section>

      <Section heading="2. What 自由工作平台 is — and is not">
        <p>
          自由工作平台 is a venue that connects clients and freelancers. We charge{' '}
          <strong>no commission on your work</strong>. We are <strong>not</strong> a party to any
          contract you form with another user, we are not an employer or employment agency, and we
          do not supervise or guarantee any work performed.
        </p>
        <p>
          自由工作平台 is non-custodial: we never hold your money. Payments are arranged directly
          between client and freelancer using the method they choose.
        </p>
      </Section>

      <Section heading="3. Eligibility and accounts">
        <Bullets
          items={[
            'You must be at least 18 years old and legally able to enter contracts.',
            'You must provide accurate information and keep your profile current.',
            'You are responsible for your account credentials and everything done under your account.',
            'New accounts are reviewed before approval; we may decline or revoke approval at our discretion.',
            'One person or organisation, one account, unless we agree otherwise in writing.',
          ]}
        />
      </Section>

      <Section heading="4. Acceptable use">
        <p>You agree not to:</p>
        <Bullets
          items={[
            'Post false, misleading, discriminatory, or unlawful content, including fake jobs or fake reviews.',
            'Harass, threaten, defraud, or impersonate anyone.',
            'Scrape, overload, probe, or attempt to circumvent security controls on the platform.',
            'Use the platform to send unsolicited bulk messages or spam.',
            'Infringe anyone’s intellectual property or confidentiality obligations.',
          ]}
        />
        <p>We may suspend or terminate accounts that break these rules.</p>
      </Section>

      <Section heading="5. Contracts between users">
        <p>
          When a client accepts a proposal, the contract is between those two users. They decide
          scope, deliverables, timelines, payment terms, and IP ownership. We recommend agreeing
          these in writing before work starts. Any dispute is primarily between the parties; our
          optional dispute process is a good-faith facilitation, not binding arbitration, unless the
          parties separately agree to it.
        </p>
      </Section>

      <Section heading="6. Payments, taxes, and fees">
        <p>
          自由工作平台 takes 0% of what you earn. Third-party payment providers you choose (for
          example Stripe, PayPal, or Wise) may charge their own processing fees, which are outside
          our control. You are solely responsible for determining, reporting, and paying your own
          taxes.
        </p>
      </Section>

      <Section heading="7. Your content">
        <p>
          You keep ownership of everything you post. You grant us a non-exclusive, worldwide,
          royalty-free licence to host, display, and distribute that content solely to operate and
          promote the service. You are responsible for having the rights to what you publish.
        </p>
      </Section>

      <Section heading="8. Disclaimers">
        <p>
          The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without
          warranties of any kind to the fullest extent permitted by law. We do not warrant that the
          platform will be uninterrupted or error-free, or that any user is qualified, reliable, or
          will perform as promised. Vet your counterparties.
        </p>
      </Section>

      <Section heading="9. Limitation of liability">
        <p>
          To the maximum extent permitted by law, 自由工作平台 is not liable for indirect,
          incidental, special, consequential, or punitive damages, or for lost profits, revenue,
          data, or goodwill. Because we charge you nothing, our aggregate liability to you is limited
          to the greater of amounts you paid us in the prior twelve months (typically zero) or USD
          100.
        </p>
      </Section>

      <Section heading="10. Termination">
        <p>
          You may close your account at any time. We may suspend or terminate access for breach of
          these Terms, legal requirements, or risk to the platform or its users. Provisions that by
          their nature should survive termination will survive.
        </p>
      </Section>

      <Section heading="11. Open source">
        <p>
          The 自由工作平台 software is released under the MIT licence. These Terms govern the
          hosted service at freelancezero.com; the software licence governs the code. Self-hosted
          instances are operated by whoever runs them, and we are not responsible for them.
        </p>
      </Section>

      <Section heading="12. Changes and contact">
        <p>
          We may update these Terms; material changes will be announced and the date above updated.
          Continued use after changes means you accept them. Questions:{' '}
          <a className="text-primary hover:underline" href="mailto:legal@freelancezero.com">
            legal@freelancezero.com
          </a>
          . See also our{' '}
          <Link className="text-primary hover:underline" href="/privacy">
            Privacy Policy
          </Link>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
