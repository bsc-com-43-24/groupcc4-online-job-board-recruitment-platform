'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  List,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  FileCheck2,
  Sparkles,
  UserRound,
} from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import DeniedAlert from '@/components/DeniedAlert';
import { ApplicationStatusTag } from '@/components/StatusTag';
import { useHydrated } from '@/hooks/useHydrated';
import {
  useJobs,
  useNotifications,
  useProfile,
  usePublishedJobs,
  useSeekerApplications,
} from '@/hooks/useStore';
import { formatDate, formatSalary } from '@/lib/format';
import { useSession } from '@/services/session';

const { Title, Text } = Typography;

function profileCompletion(
  profile: ReturnType<typeof useProfile>,
): { percent: number; missing: string[] } {
  const checks: Array<{ label: string; done: boolean }> = [
    { label: 'headline', done: Boolean(profile?.headline) },
    { label: 'phone number', done: Boolean(profile?.phone) },
    { label: 'location', done: Boolean(profile?.location) },
    { label: 'skills', done: Boolean(profile?.skills?.length) },
    { label: 'education', done: Boolean(profile?.education) },
    { label: 'work experience', done: Boolean(profile?.experience) },
    { label: 'CV', done: Boolean(profile?.cvName) },
  ];

  const done = checks.filter((check) => check.done).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter((check) => !check.done).map((check) => check.label),
  };
}

export default function SeekerDashboardPage() {
  const hydrated = useHydrated();
  const session = useSession();
  const applications = useSeekerApplications(session?.userId);
  const notifications = useNotifications(session?.userId);
  const profile = useProfile(session?.userId);
  const jobs = useJobs();
  const publishedJobs = usePublishedJobs();

  const jobsById = useMemo(
    () => new Map(jobs.map((job) => [job.id, job])),
    [jobs],
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Total: applications.length,
      'Under Review': 0,
      Shortlisted: 0,
      Interviewed: 0,
      Hired: 0,
    };

    applications.forEach((application) => {
      if (counts[application.status] !== undefined) {
        counts[application.status] += 1;
      }
    });

    return counts;
  }, [applications]);

  const completion = profileCompletion(profile);

  const recommendedJobs = useMemo(() => {
    const appliedIds = new Set(applications.map((application) => application.jobId));
    return publishedJobs
      .filter((job) => !appliedIds.has(job.id))
      .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
      .slice(0, 3);
  }, [applications, publishedJobs]);

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
                JOB SEEKER DASHBOARD
              </Text>
              <Title level={2} style={{ margin: 0, color: '#fff' }}>
                Welcome back, {session?.name.split(' ')[0] ?? 'there'}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
                {applications.length
                  ? `You have ${applications.length} application${applications.length === 1 ? '' : 's'} in progress.`
                  : 'Your next opportunity is a search away.'}
              </Text>
            </Space>
          </Col>
          <Col>
            <Space wrap>
              <Link href="/seeker/jobs">
                <Button type="primary">Browse jobs</Button>
              </Link>
              <Link href="/seeker/applications">
                <Button ghost>My applications</Button>
              </Link>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {[
          { label: 'Total applications', value: statusCounts.Total },
          { label: 'Under review', value: statusCounts['Under Review'] },
          { label: 'Shortlisted', value: statusCounts.Shortlisted },
          { label: 'Interviews', value: statusCounts.Interviewed },
          { label: 'Hired', value: statusCounts.Hired },
        ].map((stat) => (
          <Col xs={12} md={8} lg={4} key={stat.label}>
            <Card>
              <Statistic
                title={stat.label}
                value={stat.value}
                valueStyle={{ fontSize: 26, fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
        <Col xs={12} md={8} lg={4}>
          <Card>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Profile strength
            </Text>
            <Progress
              percent={completion.percent}
              size="small"
              status={completion.percent === 100 ? 'success' : 'active'}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Recent applications"
            style={{ marginBottom: 16 }}
            extra={
              <Link href="/seeker/applications">
                View all <ChevronRight size={14} aria-hidden />
              </Link>
            }
          >
            {applications.length ? (
              <List
                dataSource={applications.slice(0, 4)}
                renderItem={(application) => {
                  const job = jobsById.get(application.jobId);
                  return (
                    <List.Item
                      actions={[
                        <Link
                          key={application.id}
                          href={`/seeker/jobs/${application.jobId}`}
                        >
                          View job
                        </Link>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <BriefcaseBusiness size={18} color="#2563eb" aria-hidden />
                        }
                        title={job?.title ?? 'Vacancy no longer listed'}
                        description={`${job?.company ?? 'Unknown employer'} · applied ${formatDate(application.appliedAt)}`}
                      />
                      <ApplicationStatusTag status={application.status} />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="You haven't applied to any jobs yet."
              >
                <Link href="/seeker/jobs">
                  <Button type="primary">Find your first role</Button>
                </Link>
              </Empty>
            )}
          </Card>

          <Card
            title="Recommended for you"
            extra={
              <Link href="/seeker/jobs">
                Browse all <ArrowRight size={14} aria-hidden />
              </Link>
            }
          >
            {recommendedJobs.length ? (
              <List
                dataSource={recommendedJobs}
                renderItem={(job) => (
                  <List.Item
                    actions={[
                      <Link key={job.id} href={`/seeker/jobs/${job.id}`}>
                        View job
                      </Link>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Sparkles size={18} color="#16a34a" aria-hidden />}
                      title={job.title}
                      description={`${job.company} · ${job.location} · ${formatSalary(job.currency, job.salaryMin, job.salaryMax)}`}
                    />
                    <Tag>{job.type}</Tag>
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="You have applied to every open vacancy. Nice work."
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Profile completion" style={{ marginBottom: 16 }}>
            {completion.percent === 100 ? (
              <Alert
                type="success"
                showIcon
                message="Your profile is complete"
                description="Employers can see your CV, skills and experience."
              />
            ) : (
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <Progress percent={completion.percent} />
                <Text type="secondary">
                  Add your {completion.missing.slice(0, 3).join(', ')}
                  {completion.missing.length > 3 ? ' and more' : ''} to stand out.
                </Text>
                <Link href="/seeker/profile">
                  <Button type="primary" icon={<UserRound size={16} aria-hidden />}>
                    Complete profile
                  </Button>
                </Link>
              </Space>
            )}
          </Card>

          <Card title="Notifications">
            {notifications.length ? (
              <List
                dataSource={notifications}
                renderItem={(notification) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Bell size={16} color="#2563eb" aria-hidden />}
                      title={
                        <Space size={6}>
                          {notification.title}
                          {!notification.read ? <Tag color="blue">New</Tag> : null}
                        </Space>
                      }
                      description={
                        <>
                          <div>{notification.detail}</div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDate(notification.createdAt)}
                          </Text>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No notifications yet."
              />
            )}
          </Card>

          <Card title="Quick actions" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Link href="/seeker/profile">
                <Button block icon={<FileCheck2 size={16} aria-hidden />}>
                  Update profile and CV
                </Button>
              </Link>
              <Link href="/seeker/jobs">
                <Button block icon={<BriefcaseBusiness size={16} aria-hidden />}>
                  Search vacancies
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}
