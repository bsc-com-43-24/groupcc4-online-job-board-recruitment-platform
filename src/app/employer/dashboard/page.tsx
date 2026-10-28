'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  Col,
  Empty,
  List,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { TableProps } from 'antd';
import { BriefcaseBusiness, Plus, Users } from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import DeniedAlert from '@/components/DeniedAlert';
import { ApplicationStatusTag, JobStatusTag } from '@/components/StatusTag';
import { useHydrated } from '@/hooks/useHydrated';
import { useEmployerApplications, useEmployerJobs, useJobs } from '@/hooks/useStore';
import { deadlineLabel, formatDate } from '@/lib/format';
import { useSession } from '@/services/session';
import type { Job } from '@/mock/types';

const { Title, Text } = Typography;

export default function EmployerDashboardPage() {
  const hydrated = useHydrated();
  const session = useSession();
  const jobs = useEmployerJobs(session?.userId);
  const applications = useEmployerApplications(session?.userId);
  const allJobs = useJobs();

  const jobsById = useMemo(() => new Map(allJobs.map((job) => [job.id, job])), [allJobs]);

  const stats = useMemo(() => {
    const active = jobs.filter((job) => job.status === 'Active').length;
    const shortlisted = applications.filter(
      (application) => application.status === 'Shortlisted',
    ).length;
    const hired = applications.filter(
      (application) => application.status === 'Hired',
    ).length;

    return [
      { label: 'Active vacancies', value: active },
      { label: 'Total applicants', value: applications.length },
      { label: 'Shortlisted', value: shortlisted },
      { label: 'Hired', value: hired },
    ];
  }, [jobs, applications]);

  const jobRows = useMemo(
    () =>
      jobs.map((job) => {
        const jobApplications = applications.filter(
          (application) => application.jobId === job.id,
        );
        return {
          ...job,
          applicantCount: jobApplications.length,
          shortlistedCount: jobApplications.filter(
            (application) => application.status === 'Shortlisted',
          ).length,
        };
      }),
    [jobs, applications],
  );

  const columns: TableProps<(typeof jobRows)[number]>['columns'] = [
    {
      title: 'Vacancy',
      key: 'title',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Link href={`/employer/jobs/${record.id}`} style={{ fontWeight: 600 }}>
            {record.title}
          </Link>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {record.location} · {record.workMode}
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
      width: 120,
      render: (value: number) => <Text strong>{value}</Text>,
    },
    {
      title: 'Shortlisted',
      dataIndex: 'shortlistedCount',
      key: 'shortlistedCount',
      width: 120,
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
      width: 130,
      render: (_, record) => (
        <Link href={`/employer/jobs/${record.id}`}>
          <Button type="link" style={{ paddingInline: 0 }}>
            Manage
          </Button>
        </Link>
      ),
    },
  ];

  if (!hydrated) {
    return (
      <PageContainer>
        <Skeleton active paragraph={{ rows: 10 }} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Suspense fallback={null}>
        <DeniedAlert />
      </Suspense>

      <Card
        style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
          border: 'none',
        }}
      >
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} lg={15}>
            <Space direction="vertical" size={6}>
              <Text style={{ color: 'rgba(255,255,255,0.72)', letterSpacing: 1, fontWeight: 600 }}>
                EMPLOYER DASHBOARD
              </Text>
              <Title level={2} style={{ margin: 0, color: '#fff' }}>
                Welcome back, {session?.name.split(' ')[0] ?? 'there'}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
                {applications.length
                  ? `${applications.length} application${applications.length === 1 ? '' : 's'} across ${jobs.length} vacanc${jobs.length === 1 ? 'y' : 'ies'}.`
                  : 'Post your first vacancy and start receiving applications.'}
              </Text>
            </Space>
          </Col>
          <Col>
            <Space wrap>
              <Link href="/employer/jobs/new">
                <Button type="primary" icon={<Plus size={16} aria-hidden />}>
                  Post a job
                </Button>
              </Link>
              <Link href="/employer/applicants">
                <Button ghost icon={<Users size={16} aria-hidden />}>
                  View applicants
                </Button>
              </Link>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {stats.map((stat) => (
          <Col xs={12} lg={6} key={stat.label}>
            <Card>
              <Statistic
                title={stat.label}
                value={stat.value}
                valueStyle={{ fontSize: 26, fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card
            title="Your vacancies"
            extra={
              <Link href="/employer/jobs">
                <Button type="link">Manage all jobs</Button>
              </Link>
            }
          >
            {jobRows.length ? (
              <Table
                rowKey="id"
                columns={columns}
                dataSource={jobRows}
                pagination={false}
                scroll={{ x: 720 }}
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
        </Col>

        <Col xs={24} xl={8}>
          <Card
            title="Latest applicants"
            extra={
              <Link href="/employer/applicants">
                <Button type="link">All applicants</Button>
              </Link>
            }
          >
            {applications.length ? (
              <List
                dataSource={applications.slice(0, 5)}
                renderItem={(application) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<BriefcaseBusiness size={18} color="#2563eb" aria-hidden />}
                      title={application.seekerName}
                      description={
                        <Space direction="vertical" size={2}>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {jobsById.get(application.jobId)?.title ?? 'Removed vacancy'}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDate(application.appliedAt)}
                          </Text>
                        </Space>
                      }
                    />
                    <ApplicationStatusTag status={application.status} />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No applicants yet."
              />
            )}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}
