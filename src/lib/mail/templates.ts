/**
 * Transactional email templates. These are deliberately "doorbells": the email
 * carries no application content, only a one-line reason and a link back to the
 * platform where the real content lives.
 */

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const BRAND = '自由工作平台';
// Physical address is required by CAN-SPAM on the recruiter (cold) email.
const POSTAL = process.env.MAIL_POSTAL_ADDRESS ?? '自由工作平台 — update MAIL_POSTAL_ADDRESS';

function layout(bodyHtml: string, footerHtml: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;line-height:1.5">
${bodyHtml}
<hr style="border:none;border-top:1px solid #eaeaea;margin:24px 0"/>
<p style="font-size:12px;color:#8a8a8a">${footerHtml}</p>
</div>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0"><a href="${href}" style="background:#111;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;display:inline-block;font-weight:600">${label}</a></p>`;
}

/** Recruiter — "someone applied to your posting". Links into the app; the
 *  recruiter signs in (magic link / Google / GitHub) with this email to view. */
export function recruiterApplicantEmail(p: {
  recruiterFirstName?: string;
  companyName: string;
  jobTitle: string;
  devName: string;
  devHeadline?: string;
  viewUrl: string;
  unsubscribeUrl: string;
}): EmailContent {
  const hi = p.recruiterFirstName ? ` ${p.recruiterFirstName}` : ' there';
  const headline = p.devHeadline ? `<br/><span style="color:#555">${p.devHeadline}</span>` : '';
  const html = layout(
    `<p>Hi${hi},</p>
<p>Someone applied to your <strong>${p.jobTitle}</strong> posting.</p>
<p style="background:#f6f6f6;border-radius:8px;padding:12px 14px">
  <strong>${p.devName}</strong>${headline}
</p>
<p>Sign in with this email to view the full application and reply:</p>
${button(p.viewUrl, 'View the application')}
<p style="font-size:13px;color:#777">Or paste this link into your browser:<br/>${p.viewUrl}</p>`,
    `Sent by ${BRAND} because a freelancer applied to your public "${p.jobTitle}" posting.
 Not the right inbox? <a href="${p.unsubscribeUrl}">Unsubscribe</a>.<br/>${POSTAL}`,
  );
  const text = `Hi${hi},

Someone applied to your "${p.jobTitle}" posting.

Applicant: ${p.devName}${p.devHeadline ? ` — ${p.devHeadline}` : ''}

Sign in with this email to view the application and reply:
${p.viewUrl}

—
Sent by ${BRAND} because a freelancer applied to your public "${p.jobTitle}" posting.
Unsubscribe: ${p.unsubscribeUrl}
${POSTAL}`;
  return { subject: `New applicant for your ${p.jobTitle} posting`, html, text };
}

/** Dev (platform user) — "the company replied to you". */
export function devMessageEmail(p: {
  devFirstName?: string;
  companyName: string;
  jobTitle: string;
  preview: string;
  appUrl: string;
  settingsUrl: string;
}): EmailContent {
  const hi = p.devFirstName ? ` ${p.devFirstName}` : '';
  const html = layout(
    `<p>Hi${hi},</p>
<p><strong>${p.companyName}</strong> replied to your application for <strong>${p.jobTitle}</strong>:</p>
<blockquote style="border-left:3px solid #ddd;margin:12px 0;padding:4px 14px;color:#444">${p.preview}</blockquote>
${button(p.appUrl, 'Read and reply')}`,
    `You're receiving this because you applied via ${BRAND}.
 <a href="${p.settingsUrl}">Manage notifications</a>.`,
  );
  const text = `Hi${hi},

${p.companyName} replied to your application for ${p.jobTitle}:

  "${p.preview}"

Read and reply: ${p.appUrl}

—
Manage notifications: ${p.settingsUrl}`;
  return { subject: `${p.companyName} replied to your application`, html, text };
}
