'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Empty,
  Select,
  Skeleton,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { TableProps } from 'antd';
import { ChevronRight, FileText } from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import DeniedAlert from '@/components/DeniedAlert';
import { ApplicationStatusTag } from '@/components/StatusTag';
import { useHydrated } from '@/hooks/useHydrated';
import { useJobs, useSeekerApplications } from '@/hooks/useStore';
import { formatDate } from '@/lib/format';
import { useSession } from '@/services/session';
import type { Application, ApplicationStatus } from '@/mock/types';

const { Title, Text, Paragraph } = Typography;

const LIFECYCLE: ApplicationStatus[] = [
  'Submitted',
  'Under Review',
  'Shortlisted',
  'Interviewed',
  'Hired',
];

function ApplicationTimeline({ application }: { application: Application }) {
  if (application.status === 'Rejected') {
    return (
      <Steps
        size="small"
        direction="vertical"
        current={1}
        status="error"
        items={[
          { title: 'Application submitted', description: formatDate(application.appliedAt) },
          {
            title: 'Not selected',
            description: 'The employer moved forward with other candidates.',
          },
        ]}
      />
    );
  }

  const current = Math.max(0, LIFECYCLE.indexOf(application.status));

  return (
    <Steps
      size="small"
      direction="vertical"
      current={current}
      status={application.status === 'Hired' ? 'finish' : 'process'}
      items={LIFECYCLE.map((step, index) => ({
        title: step,
        description:
          index === 0
            ? formatDate(application.appliedAt)
            : index === current
              ? 'Current stage'
              : undefined,
      }))}
    />
  );
}

export default function SeekerApplicationsPage() {
  const hydrated = useHydrated();
  const session = useSession();
  const applications = useSeekerApplications(session?.userId);
  const jobs = useJobs();
  const [filter, setFilter] = useState<'All' | ApplicationStatus>('All');
  const [selected, setSelected] = useState<Application | null>(null);

  const jobsById = useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs]);

  const statusOptions = useMemo(() => {
    const present = Array.from(new Set(applications.map((item) => item.status)));
    return ['All', ...present];
  }, [applications]);

  const filtered = useMemo(
    () =>
      filter === 'All'
        ? applications
        : applications.filter((application) => application.status === filter),
    [applications, filter],
  );

  const columns: TableProps<Application>['columns'] = [
    {
      title: 'Vacancy',
      dataIndex: 'jobId',
      key: 'vacancy',
      render: (jobId: string) => {
        const job = jobsById.get(jobId);
        return (
          <Space direction="vertical" size={0}>
            <Link href={`/seeker/jobs/${jobId}`} style={{ fontWeight: 600 }}>
              {job?.title ?? 'Vacancy no longer listed'}
            </Link>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {job?.company ?? 'Unknown employer'}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Applied',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      width: 150,
      render: (value: string) => formatDate(value),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: ApplicationStatus) => <ApplicationStatusTag status={status} />,
    },
    {
      title: '',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Button type="link" onClick={() => setSelected(record)} style={{ paddingInline: 0 }}>
          View details <ChevronRight size={14} aria-hidden />
        </Button>
      ),
    },
  ];

  if (!hydrated) {
    return (
      <PageContainer maxWidth={1080}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </PageContainer>
    );
  }

  const selectedJob = selected ? jobsById.get(selected.jobId) : undefined;

  return (
    <PageContainer maxWidth={1080}>
      <Suspense fallback={null}>
        <DeniedAlert />
      </Suspense>

      <Space
        style={{ justifyContent: 'space-between', width: '100%', marginBottom: 16 }}
        wrap
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            My applications
          </Title>
          <Text type="secondary">
            Every application you have submitted, and where it stands today.
          </Text>
        </div>
        <Link href="/seeker/jobs">
          <Button type="primary">Browse jobs</Button>
        </Link>
      </Space>

      <Card>
        {applications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={2}>
                <Text strong>You haven&apos;t applied to anything yet</Text>
                <Text type="secondary">Once you apply, you can track progress here.</Text>
              </Space>
            }
          >
            <Link href="/seeker/jobs">
              <Button type="primary">Find a role</Button>
            </Link>
          </Empty>
        ) : (
          <>
            <Space wrap style={{ marginBottom: 16 }}>
              <Select
                aria-label="Filter applications by status"
                value={filter}
                onChange={(value) => setFilter(value as 'All' | ApplicationStatus)}
                style={{ width: 220 }}
                options={statusOptions.map((status) => ({
                  value: status,
                  label: status === 'All' ? 'All statuses' : status,
                }))}
              />
              <Text type="secondary">
                Showing {filtered.length} of {applications.length}
              </Text>
            </Space>
            <Table<Application>
              rowKey="id"
              columns={columns}
              dataSource={filtered}
              pagination={filtered.length > 8 ? { pageSize: 8 } : false}
              scroll={{ x: 640 }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No applications with this status."
                  />
                ),
              }}
            />
          </>
        )}
      </Card>

      <Drawer
        title={selectedJob?.title ?? 'Application details'}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        width={440}
      >
        {selected ? (
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <Space size={8} wrap>
              <ApplicationStatusTag status={selected.status} />
              <Tag>Ref {selected.id}</Tag>
            </Space>

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Employer">
                {selectedJob?.company ?? 'Unknown employer'}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {selectedJob?.location ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Applied on">
                {formatDate(selected.appliedAt)}
              </Descriptions.Item>
              <Descriptions.Item label="CV attached">
                {selected.cvName ?? 'Not recorded'}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <Text strong>Progress</Text>
              <div style={{ marginTop: 12 }}>
                <ApplicationTimeline application={selected} />
              </div>
            </div>

            {selected.coverLetter ? (
              <div>
                <Text strong>Your cover letter</Text>
                <Paragraph type="secondary" style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                  {selected.coverLetter}
                </Paragraph>
              </div>
            ) : null}

            <Link href={`/seeker/jobs/${selected.jobId}`}>
              <Button block icon={<FileText size={16} aria-hidden />}>
                View the vacancy
              </Button>
            </Link>
          </Space>
        ) : null}
      </Drawer>
    </PageContainer>
  );
}
