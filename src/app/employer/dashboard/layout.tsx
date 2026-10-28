import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employer dashboard',
  description: 'Vacancy performance and the latest applicants.',
};

export default function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
