import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jobs',
  description: 'Search open vacancies by role, location, work mode and contract type.',
};

export default function SeekerJobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
