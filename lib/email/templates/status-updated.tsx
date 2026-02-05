import { Text, Section } from '@react-email/components';
import { EmailLayout } from './components/email-layout';
import { EmailButton } from './components/email-button';
import { StatusUpdatedEmailData } from '../types';
import { EMAIL_CONSTANTS } from '../types';

export function StatusUpdatedEmail(data: StatusUpdatedEmailData) {
  const applicationUrl = `${EMAIL_CONSTANTS.BASE_URL}/applications`;

  // Customize content based on new status
  const getStatusContent = () => {
    switch (data.newStatus) {
      case 'INTERVIEW':
        return {
          title: 'Interview Invitation',
          emoji: '🎉',
          message: `Great news! Your application to ${data.teamName} has been reviewed, and we'd like to invite you to interview with our team.`,
          nextSteps: [
            'Check your email for interview scheduling details',
            'Prepare to discuss your experience and interest in the team',
            'Reach out if you have any questions or scheduling conflicts',
          ],
        };
      case 'OFFER':
        return {
          title: 'Congratulations!',
          emoji: '🎊',
          message: `We're thrilled to offer you a position on ${data.teamName}! We were impressed by your application and interview, and we think you'll be a great fit for our team.`,
          nextSteps: [
            'Review the offer details and accept through the portal',
            'Complete any onboarding requirements',
            'Join our team communication channels',
            'Mark your calendar for our first team meeting',
          ],
        };
      case 'ACCEPTED':
        return {
          title: 'Welcome to the Team!',
          emoji: '🚀',
          message: `Welcome to ${data.teamName}! We're excited to have you join us. Your journey with the team officially begins now.`,
          nextSteps: [
            'Watch for onboarding emails with important information',
            'Join team communication channels (Slack, email lists, etc.)',
            'Attend the new member orientation session',
            'Connect with your team lead to get started',
          ],
        };
      case 'REJECTED':
        return {
          title: 'Application Update',
          emoji: '',
          message: `Thank you for your interest in ${data.teamName}. After careful consideration, we've decided to move forward with other candidates at this time.`,
          nextSteps: [
            "This decision doesn't reflect on your abilities or potential",
            'We encourage you to apply again in future recruiting cycles',
            'Consider exploring other project teams that might be a great fit',
            "Feel free to reach out if you'd like feedback on your application",
          ],
        };
      default:
        return {
          title: 'Application Status Update',
          emoji: '📋',
          message: `Your application to ${data.teamName} has been updated.`,
          nextSteps: [
            'Check the portal for the latest information',
            'Watch for additional emails with next steps',
          ],
        };
    }
  };

  const content = getStatusContent();

  return (
    <EmailLayout preview={`${content.title} - ${data.teamName}`}>
      <Section style={greeting}>
        <Text style={title}>
          {content.emoji} {content.title}
        </Text>
        <Text style={paragraph}>Hi {data.studentName},</Text>
        <Text style={paragraph}>{content.message}</Text>
      </Section>

      <Section style={statusBox}>
        <Text style={statusLabel}>Application Status</Text>
        <Text style={statusValue}>{formatStatus(data.newStatus)}</Text>
      </Section>

      <Section>
        <Text style={paragraph}>
          <strong>Next Steps:</strong>
        </Text>
        <Text style={paragraph}>
          {content.nextSteps.map((step, index) => (
            <span key={index}>
              • {step}
              <br />
            </span>
          ))}
        </Text>

        <EmailButton href={applicationUrl}>View Application</EmailButton>

        <Text style={paragraph}>
          If you have any questions, feel free to reply to this email.
        </Text>

        <Text style={closingText}>
          Best regards,
          <br />
          {data.teamName} Team
        </Text>
      </Section>
    </EmailLayout>
  );
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    INTERVIEW: 'Interview Scheduled',
    OFFER: 'Offer Extended',
    ACCEPTED: 'Accepted - Welcome!',
    REJECTED: 'Not Selected',
    UNDER_REVIEW: 'Under Review',
  };
  return statusMap[status] || status;
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

const statusBox = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '2px solid #B31B1B',
  textAlign: 'center' as const,
};

const statusLabel = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#525252',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginBottom: '8px',
};

const statusValue = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#B31B1B',
  margin: '0',
};

const closingText = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#525252',
  marginTop: '32px',
  marginBottom: '16px',
};
