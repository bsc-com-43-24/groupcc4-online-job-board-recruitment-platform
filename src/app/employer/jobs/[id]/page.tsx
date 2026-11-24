'use client';

import { useEffect, useMemo, useState } from 'react';
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
  Space,
  Tag,
  Typography,
} from 'antd';
import { ArrowLeft, ExternalLink, Pencil } from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import PageSkeleton from '@/components/ui/PageSkeleton';
import { JobStatusTag } from '@/components/StatusTag';
import ApplicantsTable from '@/components/employer/ApplicantsTable';
import JobForm, { toJobPatch } from '@/components/employer/JobForm';
import UnauthorizedResult from '@/components/UnauthorizedResult';
import type { JobFormValues } from '@/components/employer/JobForm';
import { useHydrated } from '@/hooks/useHydrated';
import {
  useCompanies,
  useJob,
  useJobApplications,
  useJobs,
  useMockState,
} from '@/hooks/useStore';
import { deadlineLabel, formatDate, formatSalary } from '@/lib/format';
import { loadJob, updateJob } from '@/mock/store';
import { apiErrorMessage } from '@/services/api';
import { useSession } from '@/services/session';

const { Title, Text } = Typography;

export default function EmployerJobDetailPage() {
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const session = useSession();
  const job = useJob(params?.id);
  const applications = useJobApplications(params?.id);
  const allJobs = useJobs();
  const companies = useCompanies();
  const state = useMockState();
  const { message } = AntApp.useApp();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingJob, setLoadingJob] = useState(false);

  const jobsById = useMemo(() => new Map(allJobs.map((item) => [item.id, item])), [allJobs]);

  useEffect(() => {
    if (!params?.id || job) {
      return;
    }
    void (async () => {
      setLoadingJob(true);
      try {
        await loadJob(params.id);
      } catch {
        return;
      } finally {
        setLoadingJob(false);
      }
    })();
  }, [params?.id, job]);

  const handleSave = async (values: JobFormValues) => {
    if (!job) {
      return;
    }

    setSaving(true);
    try {
      await updateJob(job.id, {
        ...toJobPatch(values),
        employerId: job.employerId,
        company: job.company,
      });
      setEditing(false);
      message.success('Vacancy updated.');
    } catch (saveError) {
      message.error(apiErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  if (!hydrated || !session) {
    return (
      <PageContainer maxWidth={1180}>
        <PageSkeleton rows={10} />
      </PageContainer>
    );
  }

  if (!job) {
    if (loadingJob) {
      return (
        <PageContainer maxWidth={1180}>
          <PageSkeleton rows={10} />
        </PageContainer>
      );
    }
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
        <UnauthorizedResult
          title="This vacancy belongs to another employer"
          subTitle="Sign in with the account that posted it to manage its applicants."
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

      {state.error ? (
        <Alert type="error" showIcon message={state.error} style={{ marginBottom: 16 }} />
      ) : null}

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
          companies={companies}
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
