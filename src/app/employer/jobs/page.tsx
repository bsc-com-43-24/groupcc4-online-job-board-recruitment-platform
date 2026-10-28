'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  App as AntApp,
  Button,
  Card,
  Drawer,
  Empty,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { TableProps } from 'antd';
import { Pencil, Plus } from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import { JobStatusTag } from '@/components/StatusTag';
import JobForm, { toJobPatch } from '@/components/employer/JobForm';
import type { JobFormValues } from '@/components/employer/JobForm';
import { useHydrated } from '@/hooks/useHydrated';
import { useEmployerApplications, useEmployerJobs } from '@/hooks/useStore';
import { deadlineLabel } from '@/lib/format';
import { updateJob } from '@/mock/store';
import { useSession } from '@/services/session';
import type { Job, JobStatus } from '@/mock/types';

const { Title, Text } = Typography;

interface JobRow extends Job {
  applicantCount: number;
}

export default function EmployerJobsPage() {
  const hydrated = useHydrated();
  const session = useSession();
  const jobs = useEmployerJobs(session?.userId);
  const applications = useEmployerApplications(session?.userId);
  const { message } = AntApp.useApp();

  const [editing, setEditing] = useState<Job | null>(null);
  const [saving, setSaving] = useState(false);

  const rows = useMemo<JobRow[]>(
    () =>
      jobs
        .map((job) => ({
          ...job,
          applicantCount: applications.filter(
            (application) => application.jobId === job.id,
          ).length,
        }))
        .sort((a, b) => b.postedAt.localeCompare(a.postedAt)),
    [jobs, applications],
  );

  const handleSave = (values: JobFormValues, status: JobStatus) => {
    if (!editing) {
      return;
    }

    setSaving(true);
    updateJob(editing.id, toJobPatch(values, status));
    setSaving(false);
    setEditing(null);
    message.success(status === 'Active' ? 'Vacancy updated.' : 'Vacancy saved as draft.');
  };

  const toggleStatus = (job: Job) => {
    const nextStatus = job.status === 'Closed' ? 'Active' : 'Closed';
    updateJob(job.id, { status: nextStatus });
    message.success(
      nextStatus === 'Closed' ? 'Vacancy closed to new applications.' : 'Vacancy reopened.',
    );
  };

  const columns: TableProps<JobRow>['columns'] = [
    {
      title: 'Vacancy',
      key: 'title',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Link href={`/employer/jobs/${record.id}`} style={{ fontWeight: 600 }}>
            {record.title}
          </Link>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {record.location} · {record.workMode} · {record.type}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: Job['status']) => <JobStatusTag status={status} />,
    },
    {
      title: 'Applicants',
      dataIndex: 'applicantCount',
      key: 'applicantCount',
      width: 110,
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 170,
      render: (value: string) => <Tag>{deadlineLabel(value)}</Tag>,
    },
    {
      title: '',
      key: 'actions',
      width: 260,
      render: (_, record) => (
        <Space wrap size={4}>
          <Button
            type="link"
            icon={<Pencil size={14} aria-hidden />}
            onClick={() => setEditing(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            onClick={() => toggleStatus(record)}
            danger={record.status !== 'Closed'}
          >
            {record.status === 'Closed' ? 'Reopen' : 'Close'}
          </Button>
        </Space>
      ),
    },
  ];

  if (!hydrated) {
    return (
      <PageContainer maxWidth={1180}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={1180}>
      <Space
        style={{ justifyContent: 'space-between', width: '100%', marginBottom: 16 }}
        wrap
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            My jobs
          </Title>
          <Text type="secondary">
            Manage every vacancy you have posted, and open one to review its applicants.
          </Text>
        </div>
        <Link href="/employer/jobs/new">
          <Button type="primary" icon={<Plus size={16} aria-hidden />}>
            Post a job
          </Button>
        </Link>
      </Space>

      <Card>
        {rows.length ? (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={rows}
            pagination={rows.length > 10 ? { pageSize: 10 } : false}
            scroll={{ x: 820 }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="You haven't posted a vacancy yet."
          >
            <Link href="/employer/jobs/new">
              <Button type="primary" icon={<Plus size={16} aria-hidden />}>
                Post your first job
              </Button>
            </Link>
          </Empty>
        )}
      </Card>

      <Drawer
        title={editing ? `Edit ${editing.title}` : 'Edit vacancy'}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        width={720}
        destroyOnHidden
      >
        {editing ? (
          <JobForm
            key={editing.id}
            initialValues={editing}
            submitLabel="Save changes"
            submitting={saving}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </Drawer>
    </PageContainer>
  );
}
