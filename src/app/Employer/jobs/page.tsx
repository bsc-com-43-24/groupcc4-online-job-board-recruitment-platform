'use client';

import React from 'react';
import { Card, Typography, Button } from 'antd';
import Link from 'next/link';

export default function EmployerJobsPage() {
  return (
    <div style={{ padding: 40, maxWidth: 800, margin: '0 auto' }}>
      <Card title="Employer Portal">
        <Typography.Title level={4}>Welcome, Employer!</Typography.Title>
        <Typography.Paragraph>
          Here you will be able to post new job openings, manage current listings, and review applicant resumes.
        </Typography.Paragraph>
        <Link href="/login">
          <Button type="primary">Log Out</Button>
        </Link>
      </Card>
    </div>
  );
}