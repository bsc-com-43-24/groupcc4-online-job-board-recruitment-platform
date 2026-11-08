'use client';

import type { ReactNode } from 'react';
import { Empty } from 'antd';

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div>
          <div style={{ fontWeight: 600 }}>{title}</div>
          {description ? (
            <div style={{ marginTop: 4, color: 'var(--app-muted)' }}>{description}</div>
          ) : null}
        </div>
      }
    >
      {action}
    </Empty>
  );
}
