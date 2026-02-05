// Email sending options
export interface EmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

// Email notification types
export enum EmailType {
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  APPLICATION_STATUS_UPDATED = 'APPLICATION_STATUS_UPDATED',
  NEW_APPLICATION_ALERT = 'NEW_APPLICATION_ALERT',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
}

// Application submitted email data
export interface ApplicationSubmittedEmailData {
  studentName: string;
  teamName: string;
  applicationId: string;
  submittedAt: Date;
}

// Status updated email data
export interface StatusUpdatedEmailData {
  studentName: string;
  teamName: string;
  oldStatus: string;
  newStatus: string;
  applicationId: string;
}

// New application alert email data
export interface NewApplicationAlertEmailData {
  studentName: string;
  studentEmail: string;
  teamName: string;
  applicationId: string;
  submittedAt: Date;
  studentYear?: string;
  studentMajor?: string;
}

// Interview scheduled email data
export interface InterviewScheduledEmailData {
  studentName: string;
  teamName: string;
  interviewDate: Date;
  interviewLocation?: string;
  interviewNotes?: string;
  applicationId: string;
}

// Email constants
export const EMAIL_CONSTANTS = {
  FROM_ADDRESS: 'Cornell Project Teams <noreply@cornellprojectteams.com>',
  REPLY_TO: 'support@cornellprojectteams.com',
  BASE_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
} as const;
