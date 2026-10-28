import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My applications',
  description: 'Track every application and where it stands.',
};

export default function SeekerApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
