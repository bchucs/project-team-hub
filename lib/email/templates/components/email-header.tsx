import { Section, Text, Hr } from '@react-email/components';

export function EmailHeader() {
  return (
    <>
      <Section style={header}>
        <Text style={logo}>Cornell Project Teams</Text>
      </Section>
      <Hr style={divider} />
    </>
  );
}

const header = {
  padding: '20px 48px',
  backgroundColor: '#B31B1B', // Cornell Red
};

const logo = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
  textAlign: 'center' as const,
};

const divider = {
  borderColor: '#e6e6e6',
  margin: '0',
};
