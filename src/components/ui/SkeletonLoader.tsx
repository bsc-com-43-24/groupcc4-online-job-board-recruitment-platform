'use client';

import { Skeleton } from 'antd';

interface SkeletonLoaderProps {
  rows?: number;
  title?: boolean;
}

export default function SkeletonLoader({
  rows = 8,
  title = true,
}: SkeletonLoaderProps) {
  return <Skeleton active title={title} paragraph={{ rows }} />;
}
