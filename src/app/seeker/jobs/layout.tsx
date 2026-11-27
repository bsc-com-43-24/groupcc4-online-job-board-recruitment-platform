import type { Metadata } from 'next';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Jobs',
  description: 'Search open vacancies by role, location, work mode and contract type.',
};

export default function SeekerJobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute role="JOB_SEEKER">{children}</ProtectedRoute>;
}
