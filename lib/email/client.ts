import { Resend } from 'resend';

// Singleton Resend client
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('RESEND_API_KEY not found. Email notifications will be disabled.');
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Check if email notifications are enabled
export const isEmailEnabled = () => {
  return (
    process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true' &&
    resend !== null
  );
};
