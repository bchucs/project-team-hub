import { Text, Section } from '@react-email/components';
import { EmailLayout } from './components/email-layout';
import { EmailButton } from './components/email-button';
import { InterviewScheduledEmailData } from '../types';
import { EMAIL_CONSTANTS } from '../types';

export function InterviewScheduledEmail(data: InterviewScheduledEmailData) {
  const applicationUrl = `${EMAIL_CONSTANTS.BASE_URL}/applications`;
  const formattedDate = new Date(data.interviewDate).toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );
  const formattedTime = new Date(data.interviewDate).toLocaleTimeString(
    'en-US',
    {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }
  );

  return (
    <EmailLayout preview={`Interview scheduled with ${data.teamName}`}>
      <Section style={greeting}>
        <Text style={title}>🗓️ Interview Scheduled</Text>
        <Text style={paragraph}>Hi {data.studentName},</Text>
        <Text style={paragraph}>
          Your interview with <strong>{data.teamName}</strong> has been
          scheduled! We're looking forward to speaking with you.
        </Text>
      </Section>

      <Section style={interviewBox}>
        <Text style={interviewTitle}>Interview Details</Text>
        <Text style={interviewItem}>
          <strong>Date:</strong> {formattedDate}
        </Text>
        <Text style={interviewItem}>
          <strong>Time:</strong> {formattedTime}
        </Text>
        {data.interviewLocation && (
          <Text style={interviewItem}>
            <strong>Location:</strong> {data.interviewLocation}
          </Text>
        )}
        {data.interviewNotes && (
          <Text style={interviewNotes}>{data.interviewNotes}</Text>
        )}
      </Section>

      <Section>
        <Text style={paragraph}>
          <strong>How to Prepare:</strong>
        </Text>
        <Text style={paragraph}>
          • Review your application and be ready to discuss your experiences
          <br />
          • Research the team's current projects and mission
          <br />
          • Prepare questions for the interviewers
          <br />
          • Plan to arrive 5-10 minutes early
          <br />• Bring a copy of your resume if meeting in person
        </Text>

        <EmailButton href={applicationUrl}>View My Applications</EmailButton>

        <Text style={paragraph}>
          If you need to reschedule or have any questions, please reply to this
          email as soon as possible.
        </Text>

        <Text style={closingText}>
          Good luck!
          <br />
          {data.teamName} Team
        </Text>
      </Section>
    </EmailLayout>
  );
}

const greeting = {
  marginTop: '32px',
};

const title = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#1a1a1a',
  marginBottom: '24px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#525252',
  marginBottom: '16px',
};

const interviewBox = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '2px solid #B31B1B',
};

const interviewTitle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1a1a1a',
  marginBottom: '16px',
};

const interviewItem = {
  fontSize: '16px',
  lineHeight: '28px',
  color: '#1a1a1a',
  marginBottom: '12px',
};

const interviewNotes = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#525252',
  backgroundColor: '#ffffff',
  padding: '16px',
  borderRadius: '6px',
  marginTop: '16px',
  border: '1px solid #e6e6e6',
};

const closingText = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#525252',
  marginTop: '32px',
  marginBottom: '16px',
};
