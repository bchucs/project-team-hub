import { Text, Section } from '@react-email/components';
import { EmailLayout } from './components/email-layout';
import { EmailButton } from './components/email-button';
import { NewApplicationAlertEmailData } from '../types';
import { EMAIL_CONSTANTS } from '../types';

export function NewApplicationAlertEmail(data: NewApplicationAlertEmailData) {
  const applicationUrl = `${EMAIL_CONSTANTS.BASE_URL}/admin/applications/${data.applicationId}`;
  const dashboardUrl = `${EMAIL_CONSTANTS.BASE_URL}/admin`;
  const formattedDate = new Date(data.submittedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <EmailLayout preview={`New application from ${data.studentName}`}>
      <Section style={greeting}>
        <Text style={title}>📬 New Application Received</Text>
        <Text style={paragraph}>
          A new application has been submitted to{' '}
          <strong>{data.teamName}</strong>.
        </Text>
      </Section>

      <Section style={applicantBox}>
        <Text style={applicantName}>{data.studentName}</Text>
        <Text style={applicantDetail}>
          <strong>Email:</strong> {data.studentEmail}
        </Text>
        {data.studentYear && (
          <Text style={applicantDetail}>
            <strong>Year:</strong> {formatYear(data.studentYear)}
          </Text>
        )}
        {data.studentMajor && (
          <Text style={applicantDetail}>
            <strong>Major:</strong> {data.studentMajor}
          </Text>
        )}
        <Text style={applicantDetail}>
          <strong>Submitted:</strong> {formattedDate}
        </Text>
      </Section>

      <Section>
        <EmailButton href={applicationUrl}>Review Application</EmailButton>

        <Text style={paragraph}>
          You can also view all applications on your{' '}
          <a href={dashboardUrl} style={link}>
            admin dashboard
          </a>
          .
        </Text>

        <Text style={tipBox}>
          💡 <strong>Tip:</strong> Review applications promptly to provide a
          great candidate experience and secure top talent before other teams!
        </Text>

        <Text style={closingText}>
          Cornell Project Teams Hub
          <br />
          Admin Notification System
        </Text>
      </Section>
    </EmailLayout>
  );
}

function formatYear(year: string): string {
  const yearMap: Record<string, string> = {
    FRESHMAN: 'Freshman',
    SOPHOMORE: 'Sophomore',
    JUNIOR: 'Junior',
    SENIOR: 'Senior',
  };
  return yearMap[year] || year;
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

const applicantBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #e6e6e6',
};

const applicantName = {
  fontSize: '22px',
  fontWeight: '600',
  color: '#1a1a1a',
  marginBottom: '16px',
};

const applicantDetail = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#525252',
  marginBottom: '8px',
};

const link = {
  color: '#B31B1B',
  textDecoration: 'underline',
};

const tipBox = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fcd34d',
  borderRadius: '8px',
  padding: '16px',
  fontSize: '14px',
  lineHeight: '22px',
  color: '#525252',
  marginTop: '24px',
  marginBottom: '24px',
};

const closingText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#8898aa',
  marginTop: '32px',
  marginBottom: '16px',
};
