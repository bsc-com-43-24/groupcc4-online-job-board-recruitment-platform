'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Result,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd';
import { ArrowLeft, ExternalLink, Pencil } from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import { JobStatusTag } from '@/components/StatusTag';
import ApplicantsTable from '@/components/employer/ApplicantsTable';
import JobForm, { toJobPatch } from '@/components/employer/JobForm';
import type { JobFormValues } from '@/components/employer/JobForm';
import { useHydrated } from '@/hooks/useHydrated';
import { useJob, useJobApplications, useJobs } from '@/hooks/useStore';
import { deadlineLabel, formatDate, formatSalary } from '@/lib/format';
import { updateJob } from '@/mock/store';
import { useSession } from '@/services/session';
import type { JobStatus } from '@/mock/types';

const { Title, Text } = Typography;

export default function EmployerJobDetailPage() {
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const session = useSession();
  const job = useJob(params?.id);
  const applications = useJobApplications(params?.id);
  const allJobs = useJobs();
  const { message } = AntApp.useApp();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const jobsById = useMemo(() => new Map(allJobs.map((item) => [item.id, item])), [allJobs]);

  const handleSave = (values: JobFormValues, status: JobStatus) => {
    if (!job) {
      return;
    }

    setSaving(true);
    updateJob(job.id, toJobPatch(values, status));
    setSaving(false);
    setEditing(false);
    message.success('Vacancy updated.');
  };

  if (!hydrated || !session) {
    return (
      <PageContainer maxWidth={1180}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </PageContainer>
    );
  }

  if (!job) {
    return (
      <PageContainer maxWidth={720}>
        <Result
          status="404"
          title="Vacancy not found"
          subTitle="It may have been removed, or the link may be out of date."
          extra={
            <Link href="/employer/jobs">
              <Button type="primary">Back to my jobs</Button>
            </Link>
          }
        />
      </PageContainer>
    );
  }

  if (job.employerId !== session.userId) {
    return (
      <PageContainer maxWidth={720}>
        <Result
          status="403"
          title="This vacancy belongs to another employer"
          subTitle="Sign in with the account that posted it to manage its applicants."
          extra={
            <Link href="/employer/dashboard">
              <Button type="primary">Go to my dashboard</Button>
            </Link>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={1180}>
      <Space style={{ marginBottom: 16 }} wrap>
        <Link href="/employer/jobs">
          <Button icon={<ArrowLeft size={16} aria-hidden />}>Back to my jobs</Button>
        </Link>
      </Space>

      <Card style={{ marginBottom: 16 }}>
        <Space
          style={{ justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}
          wrap
        >
          <div>
            <Space size={8} wrap style={{ marginBottom: 6 }}>
              <JobStatusTag status={job.status} />
              <Text type="secondary">{job.company}</Text>
            </Space>
            <Title level={2} style={{ margin: 0 }}>
              {job.title}
            </Title>
            <Text type="secondary">
              {job.location} · {job.workMode} · {formatSalary(job.currency, job.salaryMin, job.salaryMax)}
            </Text>
          </div>

          <Space wrap>
            <Button icon={<Pencil size={16} aria-hidden />} onClick={() => setEditing(true)}>
              Edit vacancy
            </Button>
            <Link href={`/seeker/jobs/${job.id}`}>
              <Button icon={<ExternalLink size={16} aria-hidden />}>View public listing</Button>
            </Link>
          </Space>
        </Space>

        <Descriptions
          column={{ xs: 1, md: 3 }}
          size="small"
          style={{ marginTop: 20 }}
          items={[
            { key: 'posted', label: 'Posted', children: formatDate(job.postedAt) },
            { key: 'deadline', label: 'Deadline', children: deadlineLabel(job.deadline) },
            { key: 'applicants', label: 'Applicants', children: applications.length },
          ]}
        />

        {job.status === 'Draft' ? (
          <Alert
            type="info"
            showIcon
            style={{ marginTop: 16 }}
            message="This vacancy is still a draft"
            description="Only you can see it. Edit the vacancy and publish to make it visible to job seekers."
          />
        ) : null}
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card title={`Applicants (${applications.length})`}>
            <ApplicantsTable
              applications={applications}
              jobsById={jobsById}
              showJob={false}
              emptyDescription="No one has applied to this vacancy yet."
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card title="Vacancy details">
            <Descriptions
              column={1}
              size="small"
              items={[
                { key: 'type', label: 'Contract type', children: job.type },
                { key: 'mode', label: 'Work mode', children: job.workMode },
                {
                  key: 'salary',
                  label: 'Salary',
                  children: formatSalary(job.currency, job.salaryMin, job.salaryMax),
                },
                {
                  key: 'skills',
                  label: 'Skills',
                  children: (
                    <Space size={[4, 4]} wrap>
                      {job.skills.map((skill) => (
                        <Tag key={skill}>{skill}</Tag>
                      ))}
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Drawer
        title="Edit vacancy"
        open={editing}
        onClose={() => setEditing(false)}
        width={720}
        destroyOnHidden
      >
        <JobForm
          initialValues={job}
          submitLabel="Save changes"
          submitting={saving}
          onSubmit={handleSave}
          onCancel={() => setEditing(false)}
        />
      </Drawer>
    </PageContainer>
  );
}
