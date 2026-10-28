import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Applicants',
  description: 'Review and shortlist applicants across your vacancies.',
};

export default function EmployerApplicantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
