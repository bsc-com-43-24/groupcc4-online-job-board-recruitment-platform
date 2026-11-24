'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Input,
  Tabs,
  Typography,
  Upload,
} from 'antd';
import {
  BankOutlined,
  LockOutlined,
  MailOutlined,
  UploadOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { authService } from '@/services/authService';
import { apiErrorMessage, employerApi, validateUpload } from '@/services/api';
import { roleHome } from '@/services/session';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageSkeleton from '@/components/ui/PageSkeleton';

const { Title, Text } = Typography;

type SignupRole = 'JOB_SEEKER' | 'EMPLOYER';

interface RegisterValues {
  fullName?: string;
  companyName?: string;
  contactName?: string;
  businessDescription?: string;
  contactPhone?: string;
  location?: string;
  vatNumber?: string;
  registrationNumber?: string;
  document?: UploadFile;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = AntApp.useApp();
  const [form] = Form.useForm<RegisterValues>();

  const roleParam = searchParams.get('role');
  const [activeRole, setActiveRole] = useState<SignupRole>(
    roleParam === 'EMPLOYER' ? 'EMPLOYER' : 'JOB_SEEKER',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (key: string) => {
    setActiveRole(key as SignupRole);
    setError(null);
    form.resetFields();
  };

  const handleFinish = async (values: RegisterValues) => {
    setLoading(true);
    setError(null);

    const isEmployer = activeRole === 'EMPLOYER';
    const result = await authService.register({
      email: values.email,
      password: values.password,
      role: activeRole,
      name: isEmployer ? values.contactName ?? '' : values.fullName ?? '',
    });

    if (!result.success || !result.user) {
      setLoading(false);
      setError(result.message);
      return;
    }

    if (isEmployer) {
      const file = values.document?.originFileObj as File | undefined;
      if (!file) {
        setLoading(false);
        setError('Upload a company registration document.');
        return;
      }

      try {
        await employerApi.submitVerification({
          companyName: values.companyName ?? '',
          businessDescription: values.businessDescription ?? '',
          contactEmail: values.email,
          contactPhone: values.contactPhone ?? '',
          location: values.location ?? '',
          vatNumber: values.vatNumber ?? '',
          registrationNumber: values.registrationNumber ?? '',
          document: file,
        });
        message.success('Account created and verification request submitted.');
        router.replace('/employer/verification');
      } catch (submitError) {
        setError(
          `${apiErrorMessage(submitError)} Your account was created; submit your verification request again from the verification page.`,
        );
      } finally {
        setLoading(false);
      }
      router.refresh();
      return;
    }

    setLoading(false);
    message.success('Account created. Welcome aboard!');
    router.replace(roleHome(result.user.role));
    router.refresh();
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '48px 16px',
      }}
    >
      <Card style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Title level={3} style={{ marginBottom: 6 }}>
            Create an account
          </Title>
          <Text type="secondary">
            Register as a job seeker to apply, or as an employer to request a hiring account.
          </Text>
        </div>

        <Tabs
          activeKey={activeRole}
          onChange={handleRoleChange}
          centered
          items={[
            {
              key: 'JOB_SEEKER',
              label: (
                <span>
                  <UserOutlined aria-hidden /> Job Seeker
                </span>
              ),
            },
            {
              key: 'EMPLOYER',
              label: (
                <span>
                  <BankOutlined aria-hidden /> Employer
                </span>
              ),
            },
          ]}
        />

        {error ? (
          <Alert
            type="error"
            showIcon
            message={error}
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setError(null)}
          />
        ) : null}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
          disabled={loading}
        >
          {activeRole === 'JOB_SEEKER' ? (
            <Form.Item
              name="fullName"
              label="Full name"
              rules={[
                { required: true, whitespace: true, message: 'Enter your full name' },
                { min: 2, message: 'Name must be at least 2 characters' },
              ]}
            >
              <Input
                prefix={<UserOutlined aria-hidden />}
                placeholder="e.g. Thandiwe Banda"
                size="large"
                autoComplete="name"
              />
            </Form.Item>
          ) : (
            <>
              <Alert
                type="info"
                showIcon
                message="Public registration creates a job seeker account. Submit the employer verification request below; an administrator will upgrade the account after review."
                style={{ marginBottom: 16 }}
              />
              <Form.Item
                name="companyName"
                label="Company name"
                rules={[{ required: true, whitespace: true, message: 'Enter your company name' }]}
              >
                <Input
                  prefix={<BankOutlined aria-hidden />}
                  placeholder="e.g. TechCorp Solutions"
                  size="large"
                  autoComplete="organization"
                />
              </Form.Item>

              <Form.Item
                name="contactName"
                label="Contact person"
                rules={[{ required: true, whitespace: true, message: 'Enter the contact person' }]}
              >
                <Input
                  prefix={<UserAddOutlined aria-hidden />}
                  placeholder="e.g. Grace Mwale"
                  size="large"
                  autoComplete="name"
                />
              </Form.Item>

              <Form.Item
                name="businessDescription"
                label="Business description"
                rules={[{ required: true, whitespace: true, message: 'Describe your business' }]}
              >
                <Input.TextArea rows={3} placeholder="What does your company do?" />
              </Form.Item>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Form.Item
                  name="contactPhone"
                  label="Contact phone"
                  rules={[
                    { required: true, message: 'Enter a contact phone number' },
                    { pattern: /^[+0-9() .-]{7,50}$/, message: 'Enter a valid phone number' },
                  ]}
                >
                  <Input placeholder="+265999000111" />
                </Form.Item>
                <Form.Item
                  name="location"
                  label="Location"
                  rules={[{ required: true, whitespace: true, message: 'Enter your location' }]}
                >
                  <Input placeholder="e.g. Blantyre" />
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
                getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
                rules={[
                  {
                    validator: (_, value: UploadFile[] | undefined) => {
                      const file = value?.[0]?.originFileObj as File | undefined;
                      if (!file) {
                        return Promise.reject(new Error('Upload a company registration document'));
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
            </>
          )}

          <Form.Item
            name="email"
            label="Email address"
            rules={[
              { required: true, whitespace: true, message: 'Enter your email address' },
              { type: 'email', message: 'Enter a valid email address' },
            ]}
          >
            <Input
              prefix={<MailOutlined aria-hidden />}
              placeholder="name@example.com"
              size="large"
              autoComplete="email"
              inputMode="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Enter a password' },
              { min: 12, message: 'Use at least 12 characters' },
              { max: 72, message: 'Use no more than 72 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined aria-hidden />}
              placeholder="At least 12 characters"
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined aria-hidden />}
              placeholder="Re-enter your password"
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="terms"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error('Accept the terms to continue')),
              },
            ]}
          >
            <Checkbox>I agree to the terms of use and privacy policy.</Checkbox>
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            Register as {activeRole === 'JOB_SEEKER' ? 'Job Seeker' : 'Employer'}
          </Button>
        </Form>

        <Divider style={{ margin: '20px 0' }} />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">Already have an account? </Text>
          <Link href="/login" style={{ fontWeight: 600 }}>
            Log in
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <ProtectedRoute guestOnly>
      <Suspense fallback={<PageSkeleton rows={7} />}>
        <RegisterContent />
      </Suspense>
    </ProtectedRoute>
  );
}
