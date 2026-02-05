import { sendEmail } from './send';
import {
  ApplicationSubmittedEmailData,
  StatusUpdatedEmailData,
  NewApplicationAlertEmailData,
  InterviewScheduledEmailData,
} from './types';
import { ApplicationSubmittedEmail } from './templates/application-submitted';
import { StatusUpdatedEmail } from './templates/status-updated';
import { NewApplicationAlertEmail } from './templates/new-application-alert';
import { InterviewScheduledEmail } from './templates/interview-scheduled';

/**
 * Send application submitted confirmation email to student
 */
export async function sendApplicationSubmittedEmail(
  studentEmail: string,
  data: ApplicationSubmittedEmailData
): Promise<boolean> {
  return sendEmail({
    to: studentEmail,
    subject: `Application Submitted - ${data.teamName}`,
    react: ApplicationSubmittedEmail(data),
  });
}

/**
 * Send application status update notification to student
 */
export async function sendStatusUpdateEmail(
  studentEmail: string,
  data: StatusUpdatedEmailData
): Promise<boolean> {
  // Determine subject based on new status
  let subject = `Application Update - ${data.teamName}`;

  if (data.newStatus === 'INTERVIEW') {
    subject = `Interview Invitation - ${data.teamName}`;
  } else if (data.newStatus === 'OFFER') {
    subject = `Congratulations! Offer from ${data.teamName}`;
  } else if (data.newStatus === 'ACCEPTED') {
    subject = `Welcome to ${data.teamName}!`;
  } else if (data.newStatus === 'REJECTED') {
    subject = `Application Update - ${data.teamName}`;
  }

  return sendEmail({
    to: studentEmail,
    subject,
    react: StatusUpdatedEmail(data),
  });
}

/**
 * Send new application alert to team leads
 */
export async function sendNewApplicationAlertEmail(
  teamLeadEmail: string,
  data: NewApplicationAlertEmailData
): Promise<boolean> {
  return sendEmail({
    to: teamLeadEmail,
    subject: `New Application from ${data.studentName}`,
    react: NewApplicationAlertEmail(data),
  });
}

/**
 * Send interview scheduled notification to student
 */
export async function sendInterviewScheduledEmail(
  studentEmail: string,
  data: InterviewScheduledEmailData
): Promise<boolean> {
  return sendEmail({
    to: studentEmail,
    subject: `Interview Scheduled - ${data.teamName}`,
    react: InterviewScheduledEmail(data),
  });
}

/**
 * Batch send emails to multiple recipients (e.g., all team leads)
 */
export async function sendBatchEmails(
  emails: Array<{ to: string; data: any; type: 'new-application' }>
): Promise<void> {
  const promises = emails.map((email) => {
    if (email.type === 'new-application') {
      return sendNewApplicationAlertEmail(email.to, email.data);
    }
    return Promise.resolve(false);
  });

  await Promise.allSettled(promises);
}
