'use client';

import Link from 'next/link';
import { Button, Card, Typography } from 'antd';

const { Title, Text } = Typography;

const applications = [
  { id: 'APP-101', title: 'Senior Full Stack Developer', company: 'TechCorp Solutions', status: 'Under Review' },
  { id: 'APP-102', title: 'Frontend Engineer', company: 'Mighty Media', status: 'Shortlisted' },
];

export default function SeekerApplicationsPage() {
  return (
    <div style={{ maxWidth: 980, margin: '40px auto', padding: '0 16px' }}>
      <Card style={{ borderRadius: 16 }}>
        <Title level={2}>My Applications</Title>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {applications.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                padding: '12px 16px',
                border: '1px solid #f0f0f0',
                borderRadius: 10,
              }}
            >
              <div>
                <Text strong>{item.title}</Text>
                <div style={{ color: '#666' }}>{item.company} • {item.status}</div>
              </div>
              <Text type="secondary">{item.id}</Text>
            </div>
          ))}
        </div>
        <Link href="/job-seeker/home">
          <Button type="primary" style={{ marginTop: 16 }}>
            Back to dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
}
