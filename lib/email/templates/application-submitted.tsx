import { Text, Section } from '@react-email/components';
import { EmailLayout } from './components/email-layout';
import { EmailButton } from './components/email-button';
import { ApplicationSubmittedEmailData } from '../types';
import { EMAIL_CONSTANTS } from '../types';

export function ApplicationSubmittedEmail(data: ApplicationSubmittedEmailData) {
  const applicationUrl = `${EMAIL_CONSTANTS.BASE_URL}/applications`;
  const formattedDate = new Date(data.submittedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <EmailLayout preview={`Application submitted to ${data.teamName}`}>
      <Section style={greeting}>
        <Text style={title}>Application Submitted!</Text>
        <Text style={paragraph}>Hi {data.studentName},</Text>
        <Text style={paragraph}>
          Thank you for submitting your application to{' '}
          <strong>{data.teamName}</strong>. We've received your application and
          our team leads will review it carefully.
        </Text>
      </Section>

      <Section style={infoBox}>
        <Text style={infoTitle}>Application Details</Text>
        <Text style={infoItem}>
          <strong>Team:</strong> {data.teamName}
        </Text>
        <Text style={infoItem}>
          <strong>Submitted:</strong> {formattedDate}
        </Text>
        <Text style={infoItem}>
          <strong>Application ID:</strong> {data.applicationId.slice(0, 8)}
        </Text>
      </Section>

      <Section>
        <Text style={paragraph}>
          <strong>What's next?</strong>
        </Text>
        <Text style={paragraph}>
          • Our team leads will review your application
          <br />
          • You'll receive an email update when your application status changes
          <br />
          • If selected for an interview, you'll receive an invitation with details
          <br />• You can track your application status at any time
        </Text>

        <EmailButton href={applicationUrl}>View My Applications</EmailButton>

        <Text style={paragraph}>
          If you have any questions, feel free to reply to this email or reach
          out to the {data.teamName} team directly.
        </Text>

        <Text style={closingText}>
          Good luck!
          <br />
          Cornell Project Teams
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

const infoBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #e6e6e6',
};

const infoTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1a1a1a',
  marginBottom: '16px',
};

const infoItem = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#525252',
  marginBottom: '8px',
};

const closingText = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#525252',
  marginTop: '32px',
  marginBottom: '16px',
};
