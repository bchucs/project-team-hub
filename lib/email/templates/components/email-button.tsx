import { Button } from '@react-email/components';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button style={button} href={href}>
      {children}
    </Button>
  );
}

const button = {
  backgroundColor: '#B31B1B', // Cornell Red
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '14px 0',
  marginTop: '24px',
  marginBottom: '24px',
};
