'use client';

import SkeletonLoader from './SkeletonLoader';

interface PageSkeletonProps {
  rows?: number;
}

export default function PageSkeleton({ rows = 8 }: PageSkeletonProps) {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
      <SkeletonLoader rows={rows} />
    </div>
  );
}
