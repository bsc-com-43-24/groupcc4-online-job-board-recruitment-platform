'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card, Col, Empty, Input, List, Row, Skeleton, Space, Statistic, Tag, Typography } from 'antd';
import { Bell, BriefcaseBusiness, ChevronRight, Search, ShieldCheck, Sparkles } from 'lucide-react';

const { Title, Text } = Typography;

const userName = 'Demo User';
const latestJobs = [
  { id: 'job-101', title: 'Senior Full Stack Developer', company: 'TechCorp Solutions', location: 'Blantyre, Malawi', type: 'Full-time' },
  { id: 'job-102', title: 'Frontend Engineer', company: 'Mighty Media', location: 'Lilongwe, Malawi', type: 'Hybrid' },
  { id: 'job-103', title: 'Product Analyst', company: 'Malaika Labs', location: 'Remote', type: 'Contract' },
  { id: 'job-104', title: 'UX Researcher', company: 'Nanjira', location: 'Blantyre, Malawi', type: 'Part-time' },
  { id: 'job-105', title: 'Data Engineer', company: 'Apex Analytics', location: 'Remote', type: 'Full-time' },
];

const notifications = [
  { id: 'n-1', title: 'Application status updated', detail: 'Your application for Senior Full Stack Developer is under review.', time: '2h ago' },
  { id: 'n-2', title: 'Profile reminder', detail: 'Update your profile to improve your match score.', time: '1d ago' },
  { id: 'n-3', title: 'New jobs match your profile', detail: '3 jobs were posted that fit your skills.', time: '2d ago' },
];

const statusMeta = {
  Applied: { color: '#1677ff' },
  'Under Review': { color: '#faad14' },
  Shortlisted: { color: '#722ed1' },
  Hired: { color: '#52c41a' },
  Rejected: { color: '#ff4d4f' },
} as const;

const applicationData: Array<{ id: string; title: string; company: string; status: keyof typeof statusMeta; date: string }> = [];

export default function JobSeekerHomePage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const statusSummary = useMemo(() => {
    const summary: Record<string, number> = { Applied: 0, 'Under Review': 0, Shortlisted: 0, Hired: 0, Rejected: 0 };

    applicationData.forEach((application) => {
      if (summary[application.status] !== undefined) {
        summary[application.status] += 1;
      }
    });

    return summary;
  }, []);

  const totalApplications = applicationData.length;
  const profileComplete = false;

  const handleSearch = () => {
    const query = searchValue.trim();
    router.push(`/seeker/jobs${query ? `?keyword=${encodeURIComponent(query)}` : ''}`);
  };

  const cards = [
    { label: 'Total applications', value: totalApplications },
    { label: 'Applied', value: statusSummary.Applied },
    { label: 'Under Review', value: statusSummary['Under Review'] },
    { label: 'Shortlisted', value: statusSummary.Shortlisted },
    { label: 'Hired', value: statusSummary.Hired },
    { label: 'Rejected', value: statusSummary.Rejected },
  ];

  return (
    <div style={{ padding: '24px 16px 40px', background: '#f5f7fb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Card
          variant="borderless"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
            color: '#fff',
            borderRadius: 18,
            boxShadow: '0 12px 32px rgba(29,78,216,0.18)',
            marginBottom: 20,
          }}
        >
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col xs={24} lg={16}>
              <Space direction="vertical" size={8}>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, letterSpacing: 1.2 }}>
                  JOB SEEKER DASHBOARD
                </Text>
                <Title level={2} style={{ margin: 0, color: '#fff' }}>
                  Welcome back, {userName}!
                </Title>
                <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.82)' }}>
                  Keep your momentum going and discover the next best opportunity.
                </Text>
              </Space>
            </Col>
            <Col xs={24} lg={8} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link href="/seeker/applications" style={{ color: 'inherit' }}>
                <Button type="primary" ghost style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>
                  My applications
                </Button>
              </Link>
            </Col>
          </Row>
        </Card>

        <Card variant="borderless" style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)', marginBottom: 20 }}>
          <Input.Search
            size="large"
            placeholder="Search jobs, skills, or companies"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onSearch={handleSearch}
            enterButton={
              <span>
                <Search size={14} style={{ marginRight: 6 }} />
                Search
              </span>
            }
          />
        </Card>

        {loading ? (
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Col xs={12} sm={8} md={4} key={item}>
                <Card>
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            {cards.map((card) => (
              <Col xs={12} sm={8} md={4} key={card.label}>
                <Card variant="borderless" style={{ borderRadius: 14, boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)' }}>
                  <Statistic title={card.label} value={card.value} valueStyle={{ fontSize: 28, fontWeight: 700 }} />
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card
              title={<Title level={4} style={{ margin: 0 }}>Recent applications</Title>}
              extra={
                <Link href="/seeker/applications">
                  View all <ChevronRight size={16} />
                </Link>
              }
              style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)', marginBottom: 20 }}
            >
              {applicationData.length ? (
                <List
                  dataSource={applicationData.slice(0, 4)}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Link key={item.id} href="/seeker/applications">
                          View details
                        </Link>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<BriefcaseBusiness size={18} color="#1677ff" />}
                        title={item.title}
                        description={`${item.company} • ${item.date}`}
                      />
                      <Tag color={statusMeta[item.status].color}>{item.status}</Tag>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="You haven’t applied to any jobs yet." />
              )}
            </Card>

            <Card
              title={<Title level={4} style={{ margin: 0 }}>Latest jobs</Title>}
              extra={
                <Link href="/seeker/jobs">
                  Browse jobs <ChevronRight size={16} />
                </Link>
              }
              style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}
            >
              <List
                dataSource={latestJobs}
                renderItem={(job) => (
                  <List.Item
                    actions={[
                      <Link key={job.id} href={`/seeker/jobs/${job.id}`}>
                        View job
                      </Link>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Sparkles size={18} color="#16a34a" />}
                      title={job.title}
                      description={`${job.company} • ${job.location}`}
                    />
                    <Tag>{job.type}</Tag>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title={<Title level={4} style={{ margin: 0 }}>Profile completion</Title>} style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)', marginBottom: 20 }}>
              {!profileComplete ? (
                <Alert
                  showIcon
                  type="warning"
                  message="Your profile is still incomplete"
                  description="Add your personal details and upload a CV to boost your chances of being shortlisted."
                  action={
                    <Link href="/seeker/profile">
                      <Button type="primary">Complete profile</Button>
                    </Link>
                  }
                />
              ) : (
                <Space direction="vertical" size={12}>
                  <ShieldCheck size={32} color="#52c41a" />
                  <Text strong>Your profile is looking great.</Text>
                  <Text type="secondary">Your CV and profile details are complete.</Text>
                </Space>
              )}
            </Card>

            <Card title={<Title level={4} style={{ margin: 0 }}>Latest notifications</Title>} style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
              <List
                dataSource={notifications}
                renderItem={(notification) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Bell size={16} color="#1677ff" />}
                      title={notification.title}
                      description={
                        <>
                          <div>{notification.detail}</div>
                          <Text type="secondary" style={{ fontSize: 12 }}>{notification.time}</Text>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
