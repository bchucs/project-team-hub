import { render } from '@react-email/render';
import { resend, isEmailEnabled } from './client';
import { EmailOptions, EMAIL_CONSTANTS } from './types';

/**
 * Core email sending function with error handling
 * Non-blocking - errors are logged but don't throw
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Check if email is enabled
  if (!isEmailEnabled()) {
    console.log('[Email] Skipped (emails disabled):', options.subject);
    return false;
  }

  if (!resend) {
    console.error('[Email] Resend client not initialized');
    return false;
  }

  try {
    // Render React component to HTML
    const html = await render(options.react);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONSTANTS.FROM_ADDRESS,
      to: options.to,
      subject: options.subject,
      html,
      replyTo: EMAIL_CONSTANTS.REPLY_TO,
    });

    if (error) {
      console.error('[Email] Failed to send:', {
        to: options.to,
        subject: options.subject,
        error,
      });
      return false;
    }

    console.log('[Email] Sent successfully:', {
      id: data?.id,
      to: options.to,
      subject: options.subject,
    });

    return true;
  } catch (error) {
    console.error('[Email] Unexpected error:', {
      to: options.to,
      subject: options.subject,
      error,
    });
    return false;
  }
}

/**
 * Send email without awaiting (fire-and-forget)
 * Useful for non-critical emails that shouldn't block the main flow
 */
export function sendEmailAsync(options: EmailOptions): void {
  sendEmail(options).catch((error) => {
    console.error('[Email] Async send failed:', error);
  });
}
