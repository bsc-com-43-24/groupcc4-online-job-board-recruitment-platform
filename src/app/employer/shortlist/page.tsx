'use client';

import Link from 'next/link';
import { Alert, Card, Table, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useMockState, useShortlistedCandidates } from '@/hooks/useStore';
import EmptyState from '@/components/ui/EmptyState';
import type { ShortlistView } from '@/mock/types';
import { formatDate } from '@/lib/format';

const { Title, Paragraph } = Typography;

export default function EmployerShortlistPage() {
  const candidates = useShortlistedCandidates();
  const state = useMockState();

  const columns: TableProps<ShortlistView>['columns'] = [
    { title: 'Candidate', dataIndex: 'applicantName', key: 'applicantName' },
    { title: 'Job', dataIndex: 'jobTitle', key: 'jobTitle' },
    {
      title: 'CV',
      dataIndex: 'cvName',
      key: 'cvName',
      render: (name?: string) => name ?? 'Not provided',
    },
    {
      title: 'Shortlisted',
      dataIndex: 'shortlistedAt',
      key: 'shortlistedAt',
      render: (value?: string) => (value ? formatDate(value) : '—'),
    },
    {
      title: 'Job',
      key: 'link',
      render: (_, candidate) => (
        <Link href={`/employer/jobs/${candidate.jobId}`}>Open vacancy</Link>
      ),
    },
  ];

  return (
    <div style={{ padding: '40px 16px', maxWidth: 1100, margin: '0 auto' }}>
      <Title level={2}>Retained shortlist</Title>
      <Paragraph type="secondary">
        Candidates who were shortlisted and retained by the API.
      </Paragraph>

      {state.error ? <Alert type="error" showIcon title={state.error} style={{ marginBottom: 16 }} /> : null}

      <Card>
        {candidates.length ? (
          <Table rowKey="id" columns={columns} dataSource={candidates} pagination={{ pageSize: 10 }} />
        ) : (
          <div style={{ padding: 48 }}>
            <EmptyState
              title="No retained candidates yet"
              description="Shortlist an applicant from the applicants page to see them here."
            />
          </div>
        )}
      </Card>
    </div>
  );
}
