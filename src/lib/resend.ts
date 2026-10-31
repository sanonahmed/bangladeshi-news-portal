/**
 * Resend email client and transactional email helpers.
 *
 * Required environment variables:
 *   RESEND_API_KEY        – Resend API key
 *   RESEND_FROM_EMAIL     – Verified sender address
 *   NEXT_PUBLIC_SITE_NAME – Site display name (Bengali/Latin)
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key_for_build");
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@example.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "বাংলা নিউজ";

// ---------------------------------------------------------------------------
// Shared HTML helpers
// ---------------------------------------------------------------------------

function emailWrapper(body: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <div style="border-bottom: 3px solid #C8102E; margin-bottom: 24px; padding-bottom: 16px;">
        <span style="font-size: 22px; font-weight: bold; color: #C8102E;">${SITE_NAME}</span>
      </div>
      ${body}
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} ${SITE_NAME}. সর্বস্বত্ব সংরক্ষিত।
      </div>
    </div>
  `.trim();
}

function ctaButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 24px;background:#C8102E;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;margin:16px 0;">${label}</a>`;
}

// ---------------------------------------------------------------------------
// Verification email
// ---------------------------------------------------------------------------

/**
 * Sends an account email-verification message.
 * The link expires after 24 hours.
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationUrl: string
): Promise<void> {
  const html = emailWrapper(`
    <h2 style="color: #C8102E; margin-top: 0;">ইমেইল যাচাইকরণ</h2>
    <p>প্রিয় ${name},</p>
    <p>আপনার অ্যাকাউন্ট যাচাই করতে নিচের বাটনে ক্লিক করুন:</p>
    ${ctaButton(verificationUrl, "ইমেইল যাচাই করুন")}
    <p style="color:#6b7280;font-size:13px;">অথবা এই লিঙ্কটি ব্রাউজারে কপি করুন:</p>
    <p style="color:#6b7280;font-size:12px;word-break:break-all;">${verificationUrl}</p>
    <p style="color:#9ca3af;font-size:12px;margin-top:24px;">এই লিঙ্ক ২৪ ঘণ্টার মধ্যে মেয়াদ শেষ হয়ে যাবে।</p>
    <p style="color:#9ca3af;font-size:12px;">আপনি যদি এই অ্যাকাউন্ট তৈরি না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।</p>
  `);

  await resend.emails.send({
    from: `${SITE_NAME} <${FROM}>`,
    to,
    subject: "আপনার ইমেইল যাচাই করুন",
    html,
  });
}

// ---------------------------------------------------------------------------
// Password reset email
// ---------------------------------------------------------------------------

/**
 * Sends a password-reset link.
 * The link expires after 1 hour.
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
): Promise<void> {
  const html = emailWrapper(`
    <h2 style="color: #C8102E; margin-top: 0;">পাসওয়ার্ড রিসেট</h2>
    <p>প্রিয় ${name},</p>
    <p>আপনার পাসওয়ার্ড রিসেট করতে নিচের বাটনে ক্লিক করুন:</p>
    ${ctaButton(resetUrl, "পাসওয়ার্ড রিসেট করুন")}
    <p style="color:#6b7280;font-size:13px;">অথবা এই লিঙ্কটি ব্রাউজারে কপি করুন:</p>
    <p style="color:#6b7280;font-size:12px;word-break:break-all;">${resetUrl}</p>
    <p style="color:#9ca3af;font-size:12px;margin-top:24px;">এই লিঙ্ক ১ ঘণ্টার মধ্যে মেয়াদ শেষ হয়ে যাবে।</p>
    <p style="color:#9ca3af;font-size:12px;">আপনি যদি এই অনুরোধ না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন এবং আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করুন।</p>
  `);

  await resend.emails.send({
    from: `${SITE_NAME} <${FROM}>`,
    to,
    subject: "পাসওয়ার্ড রিসেট করুন",
    html,
  });
}

// ---------------------------------------------------------------------------
// Article published notification
// ---------------------------------------------------------------------------

/**
 * Notifies a journalist that their submitted article has been published.
 */
export async function sendArticlePublishedEmail(
  to: string,
  name: string,
  articleTitle: string,
  articleUrl: string
): Promise<void> {
  const html = emailWrapper(`
    <h2 style="color: #C8102E; margin-top: 0;">আপনার নিবন্ধ প্রকাশিত হয়েছে</h2>
    <p>প্রিয় ${name},</p>
    <p>আপনার নিবন্ধ "<strong>${articleTitle}</strong>" সফলভাবে প্রকাশিত হয়েছে।</p>
    ${ctaButton(articleUrl, "নিবন্ধটি দেখুন")}
  `);

  await resend.emails.send({
    from: `${SITE_NAME} <${FROM}>`,
    to,
    subject: `আপনার নিবন্ধ প্রকাশিত: ${articleTitle}`,
    html,
  });
}

// ---------------------------------------------------------------------------
// Article rejected notification
// ---------------------------------------------------------------------------

/**
 * Notifies a journalist that their submitted article has been rejected,
 * along with an optional reason.
 */
export async function sendArticleRejectedEmail(
  to: string,
  name: string,
  articleTitle: string,
  reason?: string
): Promise<void> {
  const reasonBlock = reason
    ? `<p><strong>কারণ:</strong> ${reason}</p>`
    : "";

  const html = emailWrapper(`
    <h2 style="color: #C8102E; margin-top: 0;">নিবন্ধ প্রত্যাখ্যাত হয়েছে</h2>
    <p>প্রিয় ${name},</p>
    <p>দুঃখিত, আপনার নিবন্ধ "<strong>${articleTitle}</strong>" এই মুহূর্তে প্রকাশের জন্য অনুমোদন পায়নি।</p>
    ${reasonBlock}
    <p>অনুগ্রহ করে প্রয়োজনীয় সংশোধনী করে পুনরায় জমা দিন।</p>
  `);

  await resend.emails.send({
    from: `${SITE_NAME} <${FROM}>`,
    to,
    subject: `নিবন্ধ পর্যালোচনা: ${articleTitle}`,
    html,
  });
}

// ---------------------------------------------------------------------------
// Welcome email
// ---------------------------------------------------------------------------

/**
 * Sends a welcome message after email verification is complete.
 */
export async function sendWelcomeEmail(
  to: string,
  name: string,
  siteUrl: string
): Promise<void> {
  const html = emailWrapper(`
    <h2 style="color: #C8102E; margin-top: 0;">স্বাগতম, ${name}!</h2>
    <p>আপনার অ্যাকাউন্ট সফলভাবে যাচাই হয়েছে।</p>
    <p>এখন আপনি ${SITE_NAME}-এর সকল সুবিধা উপভোগ করতে পারবেন।</p>
    ${ctaButton(siteUrl, "পড়া শুরু করুন")}
  `);

  await resend.emails.send({
    from: `${SITE_NAME} <${FROM}>`,
    to,
    subject: `${SITE_NAME}-এ আপনাকে স্বাগতম`,
    html,
  });
}

// Export the raw client for advanced usage
export { resend };
