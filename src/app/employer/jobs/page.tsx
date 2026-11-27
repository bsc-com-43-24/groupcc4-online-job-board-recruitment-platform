'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Drawer,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { TableProps } from 'antd';
import { Pencil } from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import PageSkeleton from '@/components/ui/PageSkeleton';
import { JobStatusTag } from '@/components/StatusTag';
import JobForm, { toJobPatch } from '@/components/employer/JobForm';
import type { JobFormValues } from '@/components/employer/JobForm';
import { useHydrated } from '@/hooks/useHydrated';
import {
  useCompanies,
  useEmployerApplications,
  useEmployerJobs,
  useMockState,
} from '@/hooks/useStore';
import { deadlineLabel } from '@/lib/format';
import { closeJob, deleteJob, updateJob } from '@/mock/store';
import { apiErrorMessage } from '@/services/api';
import { useSession } from '@/services/session';
import type { Job } from '@/mock/types';

const { Title, Text } = Typography;

interface JobRow extends Job {
  applicantCount: number;
}

export default function EmployerJobsPage() {
  const hydrated = useHydrated();
  const session = useSession();
  const jobs = useEmployerJobs(session?.userId);
  const applications = useEmployerApplications(session?.userId);
  const companies = useCompanies();
  const state = useMockState();
  const { message } = AntApp.useApp();

  const [editing, setEditing] = useState<Job | null>(null);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const handleSave = async (values: JobFormValues) => {
    if (!editing) {
      return;
    }

    setSaving(true);
    try {
      await updateJob(editing.id, {
        ...toJobPatch(values),
        employerId: editing.employerId,
        company: editing.company,
      });
      setEditing(null);
      message.success('Vacancy updated.');
    } catch (updateError) {
      message.error(apiErrorMessage(updateError));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async (job: Job) => {
    setUpdatingId(job.id);
    try {
      await closeJob(job.id);
      message.success('Vacancy closed to new applications.');
    } catch (closeError) {
      message.error(apiErrorMessage(closeError));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (job: Job) => {
    setUpdatingId(job.id);
    try {
      await deleteJob(job.id);
      message.success('Vacancy deleted.');
    } catch (deleteError) {
      message.error(apiErrorMessage(deleteError));
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: TableProps<JobRow>['columns'] = [
    {
      title: 'Vacancy',
      key: 'title',
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
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
      width: 300,
      render: (_, record) => (
        <Space wrap size={4}>
          <Button
            type="link"
            icon={<Pencil size={14} aria-hidden />}
            onClick={() => setEditing(record)}
          >
            Edit
          </Button>
          {record.status === 'Active' ? (
            <Popconfirm
              title="Close this vacancy?"
              description="Job seekers will no longer be able to apply."
              okText="Close vacancy"
              onConfirm={() => void handleClose(record)}
            >
              <Button type="link" loading={updatingId === record.id} danger>
                Close
              </Button>
            </Popconfirm>
          ) : null}
          <Popconfirm
            title="Delete this vacancy?"
            description="This cannot be undone."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => void handleDelete(record)}
          >
            <Button type="link" loading={updatingId === record.id} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!hydrated) {
    return (
      <PageContainer maxWidth={1180}>
        <PageSkeleton rows={8} />
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
      </Space>

      {state.error ? (
        <Alert type="error" showIcon title={state.error} style={{ marginBottom: 16 }} />
      ) : null}

      <Card>
        {rows.length ? (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={rows}
            pagination={rows.length > 10 ? { pageSize: 10 } : false}
            scroll={{ x: 880 }}
          />
        ) : (
          <EmptyState
            title="You haven't posted a vacancy yet"
            description="Post your first vacancy to start receiving applications."
            action={
              <Link href="/employer/jobs/new">
                <Button type="primary">Post a vacancy</Button>
              </Link>
            }
          />
        )}
      </Card>

      <Drawer
        title={editing ? `Edit ${editing.title}` : 'Edit vacancy'}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        size={720}
        destroyOnHidden
      >
        {editing ? (
          <JobForm
            key={editing.id}
            companies={companies}
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
