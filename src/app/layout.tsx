import type { Metadata, Viewport } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import AppShell from '@/components/AppShell';
import ThemeProvider from '@/components/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'JobBoard · Online Job Board & Recruitment Platform',
    template: '%s · JobBoard',
  },
  description:
    'Find vacancies, apply with your CV and track every application in one place. Employers can post roles and manage applicants end to end.',
  applicationName: 'JobBoard',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <AntdRegistry>
          <ThemeProvider>
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
