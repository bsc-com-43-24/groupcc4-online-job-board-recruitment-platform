'use client';

import { Card, Tag, Typography } from 'antd';
import type { Job } from '@/mock/jobs';

const { Text } = Typography;

export function JobCard({ job }: { job: Job }) {
  return (
    <Card title={job.title} extra={<Tag>{job.type}</Tag>} style={{ height: '100%' }}>
      <Text strong>{job.company}</Text>
      <br />
      <Text type="secondary">{job.location}</Text>
      <br />
      <Text>{job.salary}</Text>
    </Card>
  );
}