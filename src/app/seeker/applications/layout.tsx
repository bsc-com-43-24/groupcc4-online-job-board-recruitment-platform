import type { Metadata } from 'next';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata: Metadata = {
  title: 'My applications',
  description: 'Track every application and where it stands.',
};

export default function SeekerApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute role="SEEKER">{children}</ProtectedRoute>;
}
