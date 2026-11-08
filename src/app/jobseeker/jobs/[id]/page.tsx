import { redirect } from 'next/navigation';

export default function LegacyJobSeekerJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  void params;
  redirect('/seeker/jobs');
}
