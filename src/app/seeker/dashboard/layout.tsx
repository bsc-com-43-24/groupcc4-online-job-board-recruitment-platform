import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your applications, recommendations and notifications.',
};

export default function SeekerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
