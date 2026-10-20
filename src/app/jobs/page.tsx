'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Typography } from 'antd';
import { JobSearch } from '@/components/seeker';

function Content() {
  const q = useSearchParams().get('search') ?? '';
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <Typography.Title level={2}>Job Search</Typography.Title>
      <JobSearch initialQuery={q} />
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  );
}