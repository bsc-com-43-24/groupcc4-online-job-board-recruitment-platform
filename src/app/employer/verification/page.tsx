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
  Upload,
} from 'antd';
import { CheckCircleOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { apiErrorMessage, employerApi, validateUpload } from '@/services/api';
import { useCompanies, useEmployerRequests } from '@/hooks/useStore';
import { refreshAppData } from '@/mock/store';
import { useSession } from '@/services/session';
import PageSkeleton from '@/components/ui/PageSkeleton';

const { Title, Paragraph, Text } = Typography;

interface VerificationValues {
  companyName: string;
  businessDescription: string;
  contactPhone: string;
  location: string;
  registrationNumber: string;
  vatNumber: string;
  document: UploadFile[];
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
  const canCreateCompany = latestRequest?.status === 'APPROVED' && companies.length === 0;

  const handleVerification = async (values: VerificationValues) => {
    const file = values.document?.[0]?.originFileObj as File | undefined;
    if (!file) {
      setError('Upload a company registration document.');
      return;
    }

    setVerificationLoading(true);
    setError(null);
    try {
      await employerApi.submitVerification({
        companyName: values.companyName,
        businessDescription: values.businessDescription,
        contactEmail: session.email,
        contactPhone: values.contactPhone,
        location: values.location,
        registrationNumber: values.registrationNumber,
        vatNumber: values.vatNumber,
        document: file,
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
      <Title level={2}>Employer verification</Title>
      <Paragraph type="secondary">
        Employer accounts are approved by an administrator after reviewing your company documents.
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
              label="Company name"
              rules={[{ required: true, whitespace: true, message: 'Enter a company name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="businessDescription"
              label="Business description"
              rules={[{ required: true, whitespace: true, message: 'Describe your business' }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item
                name="contactPhone"
                label="Contact phone"
                rules={[
                  { required: true, message: 'Enter a phone number' },
                  { pattern: /^[+0-9() .-]{7,50}$/, message: 'Enter a valid phone number' },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, whitespace: true, message: 'Enter a location' }]}
              >
                <Input />
              </Form.Item>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item
                name="registrationNumber"
                label="Registration number"
                rules={[{ required: true, whitespace: true, message: 'Enter registration number' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="vatNumber"
                label="VAT number"
                rules={[{ required: true, whitespace: true, message: 'Enter VAT number' }]}
              >
                <Input />
              </Form.Item>
            </div>
            <Form.Item
              name="document"
              label="Company registration proof (PDF, max 5 MB)"
              valuePropName="fileList"
              rules={[
                {
                  validator: (_, value: UploadFile[] | undefined) => {
                    const file = value?.[0]?.originFileObj as File | undefined;
                    if (!file) {
                      return Promise.reject(new Error('Upload a registration document'));
                    }
                    const uploadError = validateUpload(file);
                    return uploadError
                      ? Promise.reject(new Error(uploadError))
                      : Promise.resolve();
                  },
                },
              ]}
            >
              <Upload beforeUpload={() => false} maxCount={1} accept=".pdf,application/pdf">
                <Button icon={<UploadOutlined aria-hidden />}>Choose PDF</Button>
              </Upload>
            </Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={verificationLoading}>
                Submit request
              </Button>
              <Link href="/employer/dashboard">
                <Button icon={<CheckCircleOutlined aria-hidden />}>Back to dashboard</Button>
              </Link>
            </Space>
          </Form>
        </Card>
      ) : null}
    </div>
  );
}
