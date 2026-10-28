import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post a vacancy',
  description: 'Publish a new role to the job board.',
};

export default function NewEmployerJobLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
