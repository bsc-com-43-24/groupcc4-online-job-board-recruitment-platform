'use client';

import React from 'react';
import { Card, Typography, Button, Tag, Space } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.id || 'job-101';

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: '0 auto' }}>
      <Card title={`Job Details: ${jobId}`}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Typography.Title level={3}>Senior Full Stack Developer</Typography.Title>
          <div>
            <Tag color="blue">Full-time</Tag>
            <Tag color="green">Remote</Tag>
          </div>
          <Typography.Paragraph>
            We are looking for an experienced developer proficient in Next.js, TypeScript, and Ant Design.
          </Typography.Paragraph>
          <Space>
            <Button type="primary" size="large">Apply Now</Button>
            <Link href="/login">
              <Button type="default" size="large">Log Out</Button>
            </Link>
          </Space>
        </Space>
      </Card>
    </div>
  );
}