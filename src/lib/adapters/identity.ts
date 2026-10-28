/**
 * Identity verification adapter.
 *
 * Verification is delegated to a specialist provider: the user is handed off to
 * a hosted flow that captures a government ID and a selfie/liveness check —
 * typically by scanning a QR code to continue on their phone camera — and the
 * provider tells us only the outcome.
 *
 * We deliberately never receive or store document images, ID numbers, or
 * biometrics. Handling that data ourselves would turn a marketplace into a
 * regulated processor of sensitive personal data for no benefit; all we need is
 * a boolean and an opaque reference for audit.
 *
 * Configure with IDENTITY_DRIVER. Default `none` means the feature is simply
 * unavailable rather than silently pretending to verify anyone.
 */
export type IdentityDriver = 'none' | 'manual' | 'stripe';

export interface StartVerificationParams {
  userId: string;
  email: string | null;
  /** Where the provider sends the user when the flow finishes. */
  returnUrl: string;
}

export interface StartVerificationResult {
  /** Hosted flow to send the user to (shows the QR hand-off). */
  url: string;
  /** Opaque provider reference, stored as User.identityRef. */
  ref: string;
}

export interface IdentityAdapter {
  readonly driver: IdentityDriver;
  readonly configured: boolean;
  startVerification(params: StartVerificationParams): Promise<StartVerificationResult>;
  /**
   * Translate a provider webhook body into an outcome. Returns null when the
   * event is not one we act on.
   */
  parseWebhook(
    payload: unknown,
  ): { ref: string; status: 'VERIFIED' | 'PROCESSING' | 'FAILED' } | null;
}

/** Feature switched off: callers surface "not available" rather than faking it. */
const noneAdapter: IdentityAdapter = {
  driver: 'none',
  configured: false,
  async startVerification() {
    throw new Error('Identity verification is not configured on this instance');
  },
  parseWebhook: () => null,
};

/**
 * 人工认证：用户提交真实姓名后进入 PENDING，由管理员在后台核对并置为
 * VERIFIED。没有自动核验能力，所以绝不把用户标记成已验证。
 */
const manualAdapter: IdentityAdapter = {
  driver: 'manual',
  configured: true,
  async startVerification({ userId }) {
    return { url: '', ref: `manual:${userId}` };
  },
  parseWebhook: () => null,
};

/**
 * Stripe Identity. Creates a VerificationSession and returns its hosted URL;
 * Stripe handles the document capture, the phone hand-off, and the selfie match.
 * Requires STRIPE_SECRET_KEY with Identity enabled on the account.
 */
const stripeAdapter: IdentityAdapter = {
  driver: 'stripe',
  get configured() {
    return !!process.env.STRIPE_SECRET_KEY;
  },

  async startVerification({ userId, email, returnUrl }) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');

    const body = new URLSearchParams({
      type: 'document',
      return_url: returnUrl,
      'metadata[userId]': userId,
      // Require a selfie matched against the document — this is what makes the
      // check meaningful rather than "uploaded a picture of an ID".
      'options[document][require_live_capture]': 'true',
      'options[document][require_matching_selfie]': 'true',
    });
    if (email) body.set('provided_details[email]', email);

    const res = await fetch('https://api.stripe.com/v1/identity/verification_sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Stripe Identity session failed: ${res.status} ${detail.slice(0, 200)}`);
    }

    const session = (await res.json()) as { id: string; url: string };
    return { url: session.url, ref: session.id };
  },

  parseWebhook(payload) {
    const event = payload as
      | { type?: string; data?: { object?: { id?: string } } }
      | undefined;
    const ref = event?.data?.object?.id;
    if (!ref || !event?.type) return null;

    switch (event.type) {
      case 'identity.verification_session.verified':
        return { ref, status: 'VERIFIED' };
      case 'identity.verification_session.processing':
        return { ref, status: 'PROCESSING' };
      case 'identity.verification_session.requires_input':
        return { ref, status: 'FAILED' };
      default:
        return null;
    }
  },
};

export function getIdentityAdapter(): IdentityAdapter {
  switch (process.env.IDENTITY_DRIVER) {
    case 'stripe':
      return stripeAdapter;
    case 'manual':
      return manualAdapter;
    default:
      return noneAdapter;
  }
}
