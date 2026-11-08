import type { Metadata } from 'next';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata: Metadata = {
  title: 'My profile',
  description: 'Manage your profile details and CV.',
};

export default function SeekerProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute role="SEEKER">{children}</ProtectedRoute>;
}
