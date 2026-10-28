import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My jobs',
  description: 'Post, edit and close your vacancies.',
};

export default function EmployerJobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
