'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Form,
  Input,
  Space,
  Tag,
  Typography,
} from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { apiErrorMessage, employerApi } from '@/services/api';
import { useCompanies, useEmployerRequests } from '@/hooks/useStore';
import { refreshAppData } from '@/mock/store';
import { useSession } from '@/services/session';
import PageSkeleton from '@/components/ui/PageSkeleton';

const { Title, Paragraph, Text } = Typography;

interface VerificationValues {
  companyName: string;
  businessDescription: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  vatNumber: string;
  registrationNumber: string;
}

interface CompanyValues {
  name: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  location?: string;
}

export default function EmployerVerificationPage() {
  const session = useSession();
  const requests = useEmployerRequests();
  const companies = useCompanies();
  const { message } = AntApp.useApp();
  const [verificationForm] = Form.useForm<VerificationValues>();
  const [companyForm] = Form.useForm<CompanyValues>();
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) {
    return <PageSkeleton rows={6} />;
  }

  if (session.role === 'ADMIN') {
    return (
      <div style={{ padding: 48, maxWidth: 760, margin: '0 auto' }}>
        <Alert
          type="warning"
          showIcon
          title="Administrator accounts do not submit employer verification requests."
        />
      </div>
    );
  }

  const latestRequest = requests[0];
  const canCreateCompany =
    session.role === 'EMPLOYER' &&
    latestRequest?.status === 'APPROVED' &&
    companies.length === 0;

  const handleVerification = async (values: VerificationValues) => {
    setVerificationLoading(true);
    setError(null);
    try {
      await employerApi.submitVerification({
        companyName: values.companyName,
        businessDescription: values.businessDescription,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        location: values.location,
        vatNumber: values.vatNumber,
        registrationNumber: values.registrationNumber,
      });
      message.success('Verification request submitted.');
      verificationForm.resetFields();
      await refreshAppData();
    } catch (submitError) {
      setError(apiErrorMessage(submitError));
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleCreateCompany = async (values: CompanyValues) => {
    setCompanyLoading(true);
    setError(null);
    try {
      await employerApi.createCompany(values);
      message.success('Company created. You can now post jobs.');
      companyForm.resetFields();
      await refreshAppData();
    } catch (submitError) {
      setError(apiErrorMessage(submitError));
    } finally {
      setCompanyLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 16px', maxWidth: 900, margin: '0 auto' }}>
      <Title level={2}>
        {session.role === 'JOB_SEEKER' ? 'Request employer account' : 'Employer verification'}
      </Title>
      <Paragraph type="secondary">
        {session.role === 'JOB_SEEKER'
          ? 'Submit your company details for administrator review.'
          : 'Employer accounts are approved by an administrator after reviewing your company information.'}
      </Paragraph>

      {error ? (
        <Alert
          type="error"
          showIcon
          title={error}
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setError(null)}
        />
      ) : null}

      {latestRequest ? (
        <Card style={{ marginBottom: 24 }}>
          <Space orientation="vertical" size={8} style={{ width: '100%' }}>
            <div>
              <Text strong>Latest request: </Text>
              <Text>{latestRequest.companyName}</Text>
            </div>
            <Tag
              color={
                latestRequest.status === 'APPROVED'
                  ? 'green'
                  : latestRequest.status === 'REJECTED'
                    ? 'red'
                    : 'gold'
              }
            >
              {latestRequest.status}
            </Tag>
            {latestRequest.rejectionReason ? (
              <Alert type="error" showIcon title="Reviewer note" description={latestRequest.rejectionReason} />
            ) : null}
            {latestRequest.status === 'APPROVED' ? (
              <Alert
                type="success"
                showIcon
                title="Your employer account is approved."
                description={
                  companies.length
                    ? 'You can post jobs using one of your companies.'
                    : 'Create your first company before posting a job.'
                }
              />
            ) : null}
          </Space>
        </Card>
      ) : null}

      {canCreateCompany ? (
        <Card title="Create company" style={{ marginBottom: 24 }}>
          <Form form={companyForm} layout="vertical" onFinish={handleCreateCompany}>
            <Form.Item
              name="name"
              label="Company name"
              rules={[{ required: true, whitespace: true, message: 'Enter a company name' }]}
            >
              <Input placeholder="Acme Technologies" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="contactEmail" label="Contact email" rules={[{ type: 'email' }]}>
              <Input />
            </Form.Item>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item name="contactPhone" label="Contact phone">
                <Input />
              </Form.Item>
              <Form.Item name="location" label="Location">
                <Input />
              </Form.Item>
            </div>
            <Button type="primary" htmlType="submit" loading={companyLoading}>
              Create company
            </Button>
          </Form>
        </Card>
      ) : null}

      {!latestRequest || latestRequest.status === 'REJECTED' ? (
        <Card title="Submit verification request">
          <Form
            form={verificationForm}
            layout="vertical"
            onFinish={handleVerification}
            initialValues={{ contactEmail: session.email }}
          >
            <Form.Item
              name="companyName"
              label="Company Name"
              rules={[{ required: true, whitespace: true, message: 'Enter a company name' }]}
            >
              <Input id="companyName" placeholder="Acme Technologies" />
            </Form.Item>
            <Form.Item
              name="businessDescription"
              label="Business Description"
              rules={[{ required: true, whitespace: true, message: 'Describe your business' }]}
            >
              <Input.TextArea id="businessDescription" rows={3} />
            </Form.Item>
            <Form.Item
              name="contactEmail"
              label="Contact Email"
              rules={[
                { required: true, whitespace: true, message: 'Enter a contact email' },
                { type: 'email', message: 'Enter a valid email address' },
              ]}
            >
              <Input
                id="contactEmail"
                type="email"
                placeholder="user@example.com"
                autoComplete="email"
              />
            </Form.Item>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item
                name="contactPhone"
                label="Contact Phone"
                rules={[
                  { required: true, message: 'Enter a phone number' },
                  {
                    pattern: /^(?=.*\d)[+0-9 -]{7,50}$/,
                    message: 'Use 7–50 characters with digits, +, spaces, or dashes.',
                  },
                ]}
              >
                <Input
                  id="contactPhone"
                  placeholder="8155 061089 - 514"
                  autoComplete="tel"
                />
              </Form.Item>
              <Form.Item
                name="location"
                label="Location / City"
                rules={[{ required: true, whitespace: true, message: 'Enter a location' }]}
              >
                <Input id="location" placeholder="Blantyre" />
              </Form.Item>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item
                name="vatNumber"
                label="VAT Number (optional)"
              >
                <Input id="vatNumber" />
              </Form.Item>
              <Form.Item
                name="registrationNumber"
                label="Business Registration Number (optional)"
              >
                <Input id="registrationNumber" />
              </Form.Item>
            </div>
            <Space>
              <Button type="primary" htmlType="submit" loading={verificationLoading}>
                Submit request
              </Button>
              <Link
                href={
                  session.role === 'EMPLOYER'
                    ? '/employer/dashboard'
                    : '/seeker/dashboard'
                }
              >
                <Button icon={<CheckCircleOutlined aria-hidden />}>Back to dashboard</Button>
              </Link>
            </Space>
          </Form>
        </Card>
      ) : null}
    </div>
  );
}
