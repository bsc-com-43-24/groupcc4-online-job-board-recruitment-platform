'use client';

import React, { useState } from 'react';
import {
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Divider,
  message,
  Modal,
  Upload,
  Row,
  Col,
  Avatar,
  Breadcrumb,
} from 'antd';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Send,
  UploadCloud,
  CheckCircle2,
  Building2,
  Share2,
  Bookmark,
} from 'lucide-react';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;


// Types and contracts

export interface JobVacancy {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  postedDate: string;
  deadline: string;
  description: string;
  qualifications: string[];
  requiredSkills: string[];
}

interface JobHeaderProps {
  job: JobVacancy;
  onApplyClick: () => void;
}

interface JobSummaryProps {
  job: JobVacancy;
  onApplyClick: () => void;
}

interface ApplyModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  jobTitle: string;
  companyName: string;
  onClose: () => void;
  onSubmit: () => void;
}

// 
//Sample data to be replaced with backend content

const MOCK_JOB_VACANCY: JobVacancy = {
  id: 'job-101',
  title: 'Senior Full Stack Developer',
  company: 'TechCorp Solutions',
  location: 'Blantyre, Malawi (Hybrid)',
  type: 'Full-Time',
  salary: 'MWK 2,500,000 - 3,500,000 / mo',
  postedDate: '2 days ago',
  deadline: 'Nov 15, 2026',
  description:
    'We are seeking a Senior Full Stack Developer to lead the development of our core recruitment and modern job board platform. In this role, you will collaborate with cross-functional team members in Group CC4 to build modular, secure, and highly scalable web applications.',
  qualifications: [
    'Bachelor’s degree in Computer Science, Software Engineering, or equivalent experience.',
    '4+ years of professional experience with React and modern Node.js/Next.js frameworks.',
    'Strong knowledge of TypeScript, RESTful APIs, and relational databases (PostgreSQL).',
    'Demonstrated experience with modern UI frameworks (Ant Design, Tailwind) and containerization (Docker).',
  ],
  requiredSkills: ['Next.js', 'React', 'TypeScript', 'Node.js', 'Ant Design', 'Docker', 'PostgreSQL'],
};


//sub components


/**
 * Top Header Banner containing title, company avatar, action buttons, and visual tags
 */
const JobHeader: React.FC<JobHeaderProps> = ({ job, onApplyClick }) => (
  <Card
    variant="borderless"
    style={{
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      borderRadius: 12,
      marginBottom: 24,
      background: '#ffffff',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Avatar
          size={64}
          style={{ backgroundColor: '#1677ff', fontSize: 24, fontWeight: 'bold' }}
          icon={<Building2 size={32} />}
        >
          TC
        </Avatar>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            {job.title}
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            {job.company}
          </Text>
        </div>
      </div>

      <Space wrap>
        <Button icon={<Bookmark size={16} />}>Save</Button>
        <Button icon={<Share2 size={16} />}>Share</Button>
        <Button type="primary" size="large" icon={<Send size={16} />} onClick={onApplyClick}>
          Apply Now
        </Button>
      </Space>
    </div>

    <Space size={[12, 8]} wrap style={{ marginTop: 24 }}>
      <Tag icon={<MapPin size={12} />} color="blue" style={{ padding: '4px 10px', borderRadius: 4 }}>
        {job.location}
      </Tag>
      <Tag icon={<Briefcase size={12} />} color="cyan" style={{ padding: '4px 10px', borderRadius: 4 }}>
        {job.type}
      </Tag>
      <Tag icon={<DollarSign size={12} />} color="green" style={{ padding: '4px 10px', borderRadius: 4 }}>
        {job.salary}
      </Tag>
      <Tag icon={<Clock size={12} />} style={{ padding: '4px 10px', borderRadius: 4 }}>
        Posted {job.postedDate}
      </Tag>
    </Space>
  </Card>
);

/**
 * Sticky Sidebar displaying key job details and CTA
 */
const JobSummarySidebar: React.FC<JobSummaryProps> = ({ job, onApplyClick }) => {
  const summaryItems = [
    { label: 'EMPLOYER', value: job.company },
    { label: 'LOCATION', value: job.location },
    { label: 'SALARY RANGE', value: job.salary, highlight: true },
    { label: 'APPLICATION DEADLINE', value: job.deadline },
  ];

  return (
    <Card
      variant="borderless"
      style={{
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        borderRadius: 12,
        background: '#fafafa',
      }}
    >
      <Title level={4} style={{ marginBottom: 16 }}>
        Job Summary
      </Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {summaryItems.map((item) => (
          <div key={item.label}>
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
              {item.label}
            </Text>
            <Text strong style={{ fontSize: 15, color: item.highlight ? '#3f8600' : 'inherit' }}>
              {item.value}
            </Text>
          </div>
        ))}
      </div>

      <Divider style={{ margin: '20px 0' }} />

      <Button
        type="primary"
        size="large"
        block
        icon={<Send size={16} />}
        onClick={onApplyClick}
        style={{ borderRadius: 8 }}
      >
        Apply For Position
      </Button>
    </Card>
  );
};

/**
 * Bulleted qualifications list with check icons
 */
const QualificationsList: React.FC<{ items: string[] }> = ({ items }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {items.map((req, idx) => (
      <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <CheckCircle2 size={18} color="#52c41a" style={{ marginTop: 3, flexShrink: 0 }} />
        <Text style={{ fontSize: 15, lineHeight: 1.6, color: '#434343' }}>{req}</Text>
      </div>
    ))}
  </div>
);

/**
 * Application Modal with drag-and-drop CV uploader
 */
const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  isSubmitting,
  jobTitle,
  companyName,
  onClose,
  onSubmit,
}) => (
  <Modal
    title={`Apply for ${jobTitle}`}
    open={isOpen}
    onCancel={onClose}
    footer={[
      <Button key="cancel" onClick={onClose}>
        Cancel
      </Button>,
      <Button
        key="submit"
        type="primary"
        loading={isSubmitting}
        icon={<Send size={14} />}
        onClick={onSubmit}
      >
        Submit Application
      </Button>,
    ]}
  >
    <Paragraph type="secondary" style={{ marginBottom: 20 }}>
      Upload your CV/Resume to apply directly to {companyName}.
    </Paragraph>

    <Upload.Dragger name="cv" maxCount={1} beforeUpload={() => false}>
      <p style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <UploadCloud size={40} color="#1677ff" />
      </p>
      <p className="ant-upload-text">Click or drag CV file to this area to Upload</p>
      <p className="ant-upload-hint">Supports PDF, DOCX up to 5MB.</p>
    </Upload.Dragger>
  </Modal>
);


// main component page

export default function JobDetailsPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmitApplication = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
      messageApi.success('Application & CV submitted successfully!');
    }, 1200);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 20px' }}>
      {contextHolder}

      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: 20 }}>
        <Breadcrumb
          items={[
            { title: <Link href="/">Home</Link> },
            { title: <Link href="/seeker/jobs">Job Search</Link> },
            { title: MOCK_JOB_VACANCY.title },
          ]}
        />
      </div>

      {/* Top Banner Header */}
      <JobHeader job={MOCK_JOB_VACANCY} onApplyClick={handleOpenModal} />

      {/* Main Grid Content */}
      <Row gutter={[24, 24]}>
        {/* Left Column: Job Content */}
        <Col xs={24} lg={16}>
          <Card
            variant="borderless"
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderRadius: 12,
            }}
          >
            {/* Description Section */}
            <section style={{ marginBottom: 32 }}>
              <Title level={4} style={{ color: '#1f1f1f', marginBottom: 12 }}>
                Job Overview
              </Title>
              <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#434343' }}>
                {MOCK_JOB_VACANCY.description}
              </Paragraph>
            </section>

            <Divider style={{ margin: '24px 0' }} />

            {/* Skills Section */}
            <section style={{ marginBottom: 32 }}>
              <Title level={4} style={{ color: '#1f1f1f', marginBottom: 12 }}>
                Required Skills & Tech Stack
              </Title>
              <Space size={[8, 10]} wrap>
                {MOCK_JOB_VACANCY.requiredSkills.map((skill) => (
                  <Tag
                    key={skill}
                    color="processing"
                    style={{
                      fontSize: 14,
                      padding: '6px 14px',
                      borderRadius: 16,
                      fontWeight: 500,
                    }}
                  >
                    {skill}
                  </Tag>
                 ))}
              </Space>
            </section>

            <Divider style={{ margin: '24px 0' }} />

            {/* Qualifications Section */}
            <section style={{ marginBottom: 24 }}>
              <Title level={4} style={{ color: '#1f1f1f', marginBottom: 16 }}>
                Qualifications & Key Requirements
              </Title>
              <QualificationsList items={MOCK_JOB_VACANCY.qualifications} />
            </section>
          </Card>
        </Col>

        {/* Right Column: Sticky Sidebar */}
        <Col xs={24} lg={8}>
          <JobSummarySidebar job={MOCK_JOB_VACANCY} onApplyClick={handleOpenModal} />
        </Col>
      </Row>

      {/* Application Modal */}
      <ApplyModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        jobTitle={MOCK_JOB_VACANCY.title}
        companyName={MOCK_JOB_VACANCY.company}
        onClose={handleCloseModal}
        onSubmit={handleSubmitApplication}
      />
    </div>
  );

}