'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  App as AntApp,
  Button,
  Descriptions,
  Drawer,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import type { TableProps } from 'antd';
import { FileText } from 'lucide-react';
import { ApplicationStatusTag } from '@/components/StatusTag';
import InterviewDetails from '@/components/InterviewDetails';
import InterviewForm from '@/components/employer/InterviewForm';
import EmptyState from '@/components/ui/EmptyState';
import {
  cancelInterview,
  scheduleInterview,
  setApplicationStatus,
  updateInterview,
} from '@/mock/store';
import { formatDate } from '@/lib/format';
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationStatus,
  type Job,
} from '@/mock/types';

const { Text, Paragraph } = Typography;

interface ApplicantsTableProps {
  applications: Application[];
  jobsById: Map<string, Job>;
  showJob?: boolean;
  emptyDescription?: string;
}

/**
 * Reviewer table shared by the per-vacancy screen and the all-applicants
 * screen. Extracted so filtering, sorting and the review drawer cannot drift
 * apart between the two.
 */
export default function ApplicantsTable({
  applications,
  jobsById,
  showJob = true,
  emptyDescription = 'No applications have been submitted yet.',
}: ApplicantsTableProps) {
  const { message } = AntApp.useApp();
  const [statusFilter, setStatusFilter] = useState<'All' | ApplicationStatus>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [interviewFormOpen, setInterviewFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const result = applications.filter((application) => {
      if (statusFilter !== 'All' && application.status !== statusFilter) {
        return false;
      }
      if (
        needle &&
        !`${application.seekerName} ${application.seekerEmail}`
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }
      return true;
    });

    result.sort((a, b) =>
      sortOrder === 'newest'
        ? b.appliedAt.localeCompare(a.appliedAt)
        : a.appliedAt.localeCompare(b.appliedAt),
    );

    return result;
  }, [applications, statusFilter, sortOrder, query]);

  const selected = applications.find((item) => item.id === selectedId) ?? null;

  const changeStatus = (application: Application, status: ApplicationStatus) => {
    try {
      setApplicationStatus(application.id, status);
      message.success(`${application.seekerName} moved to ${status}.`);
    } catch {
      message.error('Could not update the application status. Please try again.');
    }
  };

  const saveInterview = (
    application: Application,
    interview: Parameters<typeof scheduleInterview>[1],
  ): boolean => {
    try {
      const saved =
        application.interview?.status === 'Scheduled'
          ? updateInterview(application.id, interview)
          : scheduleInterview(application.id, interview);

      if (saved) {
        message.success(
          application.interview?.status === 'Scheduled'
            ? 'Interview updated. The applicant has been notified.'
            : 'Interview scheduled. The applicant has been notified.',
        );
      }
      return saved;
    } catch {
      message.error('Could not save the interview. Please try again.');
      return false;
    }
  };

  const handleCancelInterview = (application: Application) => {
    try {
      if (cancelInterview(application.id)) {
        message.success('Interview cancelled. The applicant has been notified.');
      } else {
        message.error('This interview is no longer scheduled.');
      }
    } catch {
      message.error('Could not cancel this interview. Please try again.');
    }
  };

  const columns: TableProps<Application>['columns'] = [
    {
      title: 'Applicant',
      key: 'applicant',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.seekerName}</Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {record.seekerEmail}
          </Text>
        </Space>
      ),
    },
    ...(showJob
      ? [
          {
            title: 'Vacancy',
            key: 'vacancy',
            render: (_: unknown, record: Application) => {
              const job = jobsById.get(record.jobId);
              return job ? (
                <Link href={`/employer/jobs/${job.id}`}>{job.title}</Link>
              ) : (
                <Text type="secondary">Removed vacancy</Text>
              );
            },
          },
        ]
      : []),
    {
      title: 'Applied',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      width: 140,
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
      width: 130,
      render: (_, record) => (
        <Button type="link" onClick={() => setSelectedId(record.id)} style={{ paddingInline: 0 }}>
          Review
        </Button>
      ),
    },
  ];

  return (
    <>
      <Space wrap style={{ marginBottom: 16 }}>
        <Input.Search
          allowClear
          placeholder="Search by name or email"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          style={{ width: 260 }}
          aria-label="Search applicants"
        />
        <Select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          style={{ width: 170 }}
          options={[
            { value: 'All', label: 'All statuses' },
            ...APPLICATION_STATUSES.map((status) => ({ value: status, label: status })),
          ]}
        />
        <Select
          aria-label="Sort applicants"
          value={sortOrder}
          onChange={(value) => setSortOrder(value)}
          style={{ width: 170 }}
          options={[
            { value: 'newest', label: 'Newest first' },
            { value: 'oldest', label: 'Oldest first' },
          ]}
        />
        <Text type="secondary">
          {filtered.length} of {applications.length} applicants
        </Text>
      </Space>

      <Table<Application>
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        pagination={filtered.length > 8 ? { pageSize: 8 } : false}
        scroll={{ x: 720 }}
        locale={{
          emptyText: <EmptyState title={emptyDescription} />,
        }}
      />

      <Drawer
        title={selected ? selected.seekerName : 'Applicant'}
        open={Boolean(selected)}
        onClose={() => {
          setSelectedId(null);
          setInterviewFormOpen(false);
        }}
        size="large"
      >
        {selected ? (
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <Space size={8} wrap>
              <ApplicationStatusTag status={selected.status} />
              <Text type="secondary">Ref {selected.id}</Text>
            </Space>

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Email">{selected.seekerEmail}</Descriptions.Item>
              <Descriptions.Item label="Applied on">
                {formatDate(selected.appliedAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Vacancy">
                {jobsById.get(selected.jobId)?.title ?? 'Removed vacancy'}
              </Descriptions.Item>
              <Descriptions.Item label="CV">
                {selected.cvName ?? 'Not attached'}
              </Descriptions.Item>
            </Descriptions>

            {selected.coverLetter ? (
              <div>
                <Text strong>Cover letter</Text>
                <Paragraph
                  type="secondary"
                  style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}
                >
                  {selected.coverLetter}
                </Paragraph>
              </div>
            ) : (
              <Text type="secondary">No cover letter was provided.</Text>
            )}

            <div>
              <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
                <Text strong>Interview</Text>
                {selected.interview?.status === 'Scheduled' ? (
                  <Space size={4}>
                    <Button type="link" onClick={() => setInterviewFormOpen(true)}>
                      Edit
                    </Button>
                    <Popconfirm
                      title="Cancel this interview?"
                      description="The job seeker will be notified."
                      okText="Cancel interview"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => handleCancelInterview(selected)}
                    >
                      <Button type="link" danger>
                        Cancel interview
                      </Button>
                    </Popconfirm>
                  </Space>
                ) : selected.status === 'Shortlisted' ? (
                  <Button type="primary" onClick={() => setInterviewFormOpen(true)}>
                    Schedule interview
                  </Button>
                ) : null}
              </Space>
              {selected.interview ? (
                <div style={{ marginTop: 10 }}>
                  <InterviewDetails interview={selected.interview} />
                </div>
              ) : (
                <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                  {selected.status === 'Shortlisted'
                    ? 'No interview has been scheduled yet.'
                    : 'Interviews can be scheduled once an applicant is shortlisted.'}
                </Text>
              )}
            </div>

            <div>
              <Text strong>Move to</Text>
              <Space wrap size={8} style={{ marginTop: 10 }}>
                {APPLICATION_STATUSES.filter(
                  (status) => status !== selected.status,
                ).map((status) => (
                  <Button
                    key={status}
                    onClick={() => changeStatus(selected, status)}
                    danger={status === 'Rejected'}
                    type={status === 'Hired' ? 'primary' : 'default'}
                  >
                    {status}
                  </Button>
                ))}
              </Space>
            </div>

            <Link href={`/employer/jobs/${selected.jobId}`}>
              <Button block icon={<FileText size={16} aria-hidden />}>
                Open the vacancy
              </Button>
            </Link>
          </Space>
        ) : null}
      </Drawer>

      {selected ? (
        <InterviewForm
          key={`${selected.id}-${selected.interview?.status ?? 'new'}`}
          open={interviewFormOpen}
          applicantName={selected.seekerName}
          interview={selected.interview}
          onClose={() => setInterviewFormOpen(false)}
          onSave={(interview) => saveInterview(selected, interview)}
        />
      ) : null}
    </>
  );
}
