import { Section, Text, Link, Hr } from '@react-email/components';
import { EMAIL_CONSTANTS } from '../../types';

export function EmailFooter() {
  return (
    <>
      <Hr style={divider} />
      <Section style={footer}>
        <Text style={footerText}>
          Cornell Project Teams Hub
          <br />
          Connecting students with engineering project teams
        </Text>
        <Text style={footerLinks}>
          <Link href={`${EMAIL_CONSTANTS.BASE_URL}/`} style={link}>
            Browse Teams
          </Link>
          {' • '}
          <Link href={`${EMAIL_CONSTANTS.BASE_URL}/applications`} style={link}>
            My Applications
          </Link>
          {' • '}
          <Link href={`${EMAIL_CONSTANTS.BASE_URL}/profile`} style={link}>
            Profile
          </Link>
        </Text>
        <Text style={footerNote}>
          You're receiving this email because you have an account on Cornell
          Project Teams Hub.
        </Text>
      </Section>
    </>
  );
}

const divider = {
  borderColor: '#e6e6e6',
  margin: '32px 0',
};

const footer = {
  padding: '0 48px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const footerLinks = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const link = {
  color: '#B31B1B',
  textDecoration: 'underline',
};

const footerNote = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  marginTop: '16px',
};
