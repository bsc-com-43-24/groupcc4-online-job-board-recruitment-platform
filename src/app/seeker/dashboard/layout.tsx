import type { Metadata } from 'next';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your applications, recommendations and notifications.',
};

export default function SeekerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute role="SEEKER">{children}</ProtectedRoute>;
}
