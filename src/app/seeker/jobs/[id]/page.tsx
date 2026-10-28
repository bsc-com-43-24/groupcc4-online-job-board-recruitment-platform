'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Alert,
  App as AntApp,
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  Input,
  Modal,
  Result,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
  Upload,
} from 'antd';
import type { UploadProps } from 'antd';
import {
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  Download,
  DollarSign,
  MapPin,
  Send,
  Share2,
  UploadCloud,
} from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import { ApplicationStatusTag } from '@/components/StatusTag';
import { useHydrated } from '@/hooks/useHydrated';
import { useJob, useJobApplications } from '@/hooks/useStore';
import { formatDate, formatSalary, deadlineLabel, isDeadlinePassed } from '@/lib/format';
import { applyToJob } from '@/mock/store';
import { loginHref, useSession } from '@/services/session';

const { Title, Text, Paragraph } = Typography;

const MAX_CV_BYTES = 5 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = /\.(pdf|docx?)$/i;

const uploadProps = (onReject: (reason: string) => void): UploadProps => ({
  name: 'cv',
  maxCount: 1,
  accept: '.pdf,.doc,.docx',
  multiple: false,
  beforeUpload: (file) => {
    const extensionAllowed = ACCEPTED_EXTENSIONS.test(file.name);
    const typeAllowed =
      !file.type ||
      file.type === 'application/pdf' ||
      file.type === 'application/msword' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!extensionAllowed || !typeAllowed) {
      onReject('Attach a PDF or Word document.');
      return Upload.LIST_IGNORE;
    }

    if (file.size > MAX_CV_BYTES) {
      onReject('Your CV must be 5 MB or smaller.');
      return Upload.LIST_IGNORE;
    }

    return false;
  },
});

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Text type="secondary" style={{ display: 'block', fontSize: 12, letterSpacing: 0.4 }}>
        {label.toUpperCase()}
      </Text>
      <Text strong style={{ fontSize: 15 }}>
        {value}
      </Text>
    </div>
  );
}

function SkillList({ skills }: { skills: string[] }) {
  if (!skills.length) {
    return <Text type="secondary">No specific skills listed.</Text>;
  }

  return (
    <Space size={[8, 8]} wrap>
      {skills.map((skill) => (
        <Tag key={skill} color="processing" style={{ padding: '4px 12px', borderRadius: 999 }}>
          {skill}
        </Tag>
      ))}
    </Space>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items.length) {
    return <Text type="secondary">Not specified for this role.</Text>;
  }

  return (
    <ul style={{ margin: 0, paddingInlineStart: 20, lineHeight: 1.8 }}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function JobNotFound() {
  return (
    <PageContainer maxWidth={720}>
      <Result
        status="404"
        title="This vacancy is no longer available"
        subTitle="It may have been removed or the link may be out of date."
        extra={[
          <Link href="/seeker/jobs" key="browse">
            <Button type="primary">Browse open vacancies</Button>
          </Link>,
        ]}
      />
    </PageContainer>
  );
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const session = useSession();
  const hydrated = useHydrated();
  const { message } = AntApp.useApp();

  const job = useJob(params?.id);
  const applications = useJobApplications(job?.id);
  const myApplication = applications.find(
    (application) => application.seekerId === session?.userId,
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cvName, setCvName] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [uploadKey, setUploadKey] = useState(0);

  if (!job) {
    if (!hydrated) {
      return (
        <PageContainer maxWidth={1100}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </PageContainer>
      );
    }
    return <JobNotFound />;
  }

  const closed =
    job.status !== 'Active' || isDeadlinePassed(job.deadline);

  const resetModal = () => {
    setCvName(null);
    setCoverLetter('');
    setUploadKey((key) => key + 1);
  };

  const openApply = () => {
    if (!session) {
      router.push(loginHref(`/seeker/jobs/${job.id}`));
      return;
    }
    resetModal();
    setModalOpen(true);
  };

  const handleShare = async () => {
    const url = typeof window === 'undefined' ? '' : window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: job.title, text: job.summary, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      message.success('Job link copied to your clipboard.');
    } catch {
      message.info('Copy the address bar to share this vacancy.');
    }
  };

  const handleSubmit = async () => {
    if (!session) {
      setModalOpen(false);
      router.push(loginHref(`/seeker/jobs/${job.id}`));
      return;
    }

    if (!cvName) {
      message.error('Attach your CV before submitting.');
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const application = applyToJob({
      job,
      seekerId: session.userId,
      seekerName: session.name,
      seekerEmail: session.email,
      coverLetter: coverLetter.trim() || undefined,
      cvName,
    });

    setSubmitting(false);
    setModalOpen(false);

    if (!application) {
      message.info('You have already applied to this vacancy.');
      return;
    }

    message.success('Application submitted. Track its progress under My applications.');
    resetModal();
  };

  const applyBlock = myApplication ? (
    <Alert
      type="success"
      showIcon
      message="Application submitted"
      description={
        <Space direction="vertical" size={4}>
          <Text>
            You applied on {formatDate(myApplication.appliedAt)}.
          </Text>
          <Space size={8}>
            <Text>Status:</Text>
            <ApplicationStatusTag status={myApplication.status} />
          </Space>
        </Space>
      }
    />
  ) : closed ? (
    <Alert
      type="warning"
      showIcon
      message="Applications are closed"
      description={
        job.status === 'Closed'
          ? 'This vacancy has been closed by the employer.'
          : `The deadline was ${formatDate(job.deadline)}.`
      }
    />
  ) : (
    <Button type="primary" size="large" block onClick={openApply} icon={<Send size={16} aria-hidden />}>
      Apply for this position
    </Button>
  );

  return (
    <PageContainer maxWidth={1150}>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link href="/">Home</Link> },
          { title: <Link href="/seeker/jobs">Browse jobs</Link> },
          { title: job.title },
        ]}
      />

      <Card style={{ marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Space size={16} align="start">
            <span
              aria-hidden
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: 14,
                background: 'rgba(37, 99, 235, 0.12)',
                color: '#2563eb',
                flexShrink: 0,
              }}
            >
              <Building2 size={26} />
            </span>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                {job.title}
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                {job.company} · {job.location}
              </Text>
            </div>
          </Space>

          <Space wrap>
            <Button icon={<Share2 size={16} aria-hidden />} onClick={handleShare}>
              Share
            </Button>
            {!myApplication && !closed ? (
              <Button type="primary" icon={<Send size={16} aria-hidden />} onClick={openApply}>
                Apply now
              </Button>
            ) : null}
          </Space>
        </div>

        <Space size={[8, 8]} wrap style={{ marginTop: 20 }}>
          <Tag icon={<MapPin size={12} aria-hidden />} color="blue">
            {job.location}
          </Tag>
          <Tag icon={<Briefcase size={12} aria-hidden />} color="cyan">
            {job.type}
          </Tag>
          <Tag color="geekblue">{job.workMode}</Tag>
          <Tag icon={<DollarSign size={12} aria-hidden />} color="green">
            {formatSalary(job.currency, job.salaryMin, job.salaryMax)}
          </Tag>
          <Tag icon={<Clock size={12} aria-hidden />}>Posted {formatDate(job.postedAt)}</Tag>
          <Tag icon={<CalendarClock size={12} aria-hidden />} color={closed ? 'red' : 'gold'}>
            {deadlineLabel(job.deadline)}
          </Tag>
        </Space>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card>
              <Title level={4} style={{ marginTop: 0 }}>
                Job overview
              </Title>
              <Paragraph style={{ marginBottom: 0, lineHeight: 1.8 }}>
                {job.description}
              </Paragraph>
            </Card>

            <Card>
              <Title level={4} style={{ marginTop: 0 }}>
                What you will do
              </Title>
              <BulletList items={job.responsibilities} />
            </Card>

            <Card>
              <Title level={4} style={{ marginTop: 0 }}>
                Qualifications and requirements
              </Title>
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                {job.qualifications.length ? (
                  job.qualifications.map((item) => (
                    <Space key={item} align="start" size={10}>
                      <CheckCircle2
                        size={18}
                        color="#16a34a"
                        aria-hidden
                        style={{ marginTop: 3, flexShrink: 0 }}
                      />
                      <Text style={{ lineHeight: 1.7 }}>{item}</Text>
                    </Space>
                  ))
                ) : (
                  <Text type="secondary">Not specified for this role.</Text>
                )}
              </Space>
            </Card>

            <Card>
              <Title level={4} style={{ marginTop: 0 }}>
                Skills
              </Title>
              <SkillList skills={job.skills} />
            </Card>
          </Space>
        </Col>

        <Col xs={24} lg={8}>
          <div id="job-summary" style={{ position: 'sticky', top: 88 }}>
            <Card>
              <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
                Job summary
              </Title>

              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <SummaryRow label="Employer" value={job.company} />
                <SummaryRow label="Location" value={job.location} />
                <SummaryRow label="Work mode" value={job.workMode} />
                <SummaryRow
                  label="Salary"
                  value={formatSalary(job.currency, job.salaryMin, job.salaryMax)}
                />
                <SummaryRow label="Application deadline" value={formatDate(job.deadline)} />
              </Space>

              <Divider style={{ margin: '20px 0' }} />

              {applyBlock}

              <Text
                type="secondary"
                style={{ display: 'block', marginTop: 12, fontSize: 12, textAlign: 'center' }}
              >
                You can withdraw or update your CV from My applications.
              </Text>
            </Card>
          </div>
        </Col>
      </Row>

      <Modal
        title={`Apply for ${job.title}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        okText="Submit application"
        okButtonProps={{ loading: submitting, disabled: !cvName }}
        onOk={handleSubmit}
        destroyOnHidden
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Text type="secondary">
            {job.company} will receive your CV and the details on your profile.
          </Text>

          <div>
            <Text strong>Upload your CV</Text>
            <Upload.Dragger
              key={uploadKey}
              {...uploadProps((reason) => message.error(reason))}
              onChange={({ fileList }) => {
                setCvName(fileList[0]?.name ?? null);
              }}
              style={{ marginTop: 8 }}
            >
              <p style={{ margin: 0 }}>
                <UploadCloud size={28} aria-hidden color="#2563eb" />
              </p>
              <p className="ant-upload-text">Click or drag your CV here</p>
              <p className="ant-upload-hint">PDF or Word document, up to 5 MB.</p>
            </Upload.Dragger>
          </div>

          <div>
            <Text strong>Cover letter (optional)</Text>
            <Input.TextArea
              rows={4}
              style={{ marginTop: 8 }}
              placeholder="Tell the employer why you are a good fit."
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              maxLength={800}
              showCount
            />
          </div>

          {cvName ? (
            <Text type="secondary">
              <Download size={14} aria-hidden /> Attached: {cvName}
            </Text>
          ) : (
            <Text type="secondary">A CV is required before you can submit.</Text>
          )}
        </Space>
      </Modal>
    </PageContainer>
  );
}
