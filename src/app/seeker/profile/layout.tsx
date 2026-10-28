import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My profile',
  description: 'Manage your profile details and CV.',
};

export default function SeekerProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
