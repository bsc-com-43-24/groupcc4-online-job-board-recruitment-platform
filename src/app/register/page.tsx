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
} from 'antd';
import {
  BankOutlined,
  LockOutlined,
  MailOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { authService } from '@/services/authService';
import type { Role } from '@/mock/types';
import { roleHome } from '@/services/session';

const { Title, Text } = Typography;

interface RegisterValues {
  fullName?: string;
  companyName?: string;
  contactName?: string;
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
  const [activeRole, setActiveRole] = useState<Role>(
    roleParam === 'EMPLOYER' ? 'EMPLOYER' : 'SEEKER',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (key: string) => {
    setActiveRole(key as Role);
    setError(null);
    form.resetFields();
  };

  const handleFinish = async (values: RegisterValues) => {
    setLoading(true);
    setError(null);

    const isEmployer = activeRole === 'EMPLOYER';
    const name = isEmployer ? values.contactName ?? '' : values.fullName ?? '';

    const result = await authService.register({
      email: values.email,
      password: values.password,
      role: activeRole,
      name,
      companyName: isEmployer ? values.companyName : undefined,
    });

    setLoading(false);

    if (!result.success || !result.user) {
      setError(result.message);
      return;
    }

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
      <Card style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Title level={3} style={{ marginBottom: 6 }}>
            Create an account
          </Title>
          <Text type="secondary">
            Register as a job seeker to apply, or as an employer to post vacancies.
          </Text>
        </div>

        <Tabs
          activeKey={activeRole}
          onChange={handleRoleChange}
          centered
          items={[
            {
              key: 'SEEKER',
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
          {activeRole === 'SEEKER' ? (
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
              <Form.Item
                name="companyName"
                label="Company name"
                rules={[
                  { required: true, whitespace: true, message: 'Enter your company name' },
                ]}
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
                rules={[
                  { required: true, whitespace: true, message: 'Enter the contact person' },
                ]}
              >
                <Input
                  prefix={<UserAddOutlined aria-hidden />}
                  placeholder="e.g. Grace Mwale"
                  size="large"
                  autoComplete="name"
                />
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
              { min: 8, message: 'Use at least 8 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined aria-hidden />}
              placeholder="At least 8 characters"
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
            <Checkbox>
              I agree to the terms of use and privacy policy for this demo.
            </Checkbox>
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            Register as {activeRole === 'SEEKER' ? 'Job Seeker' : 'Employer'}
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
    <Suspense fallback={<div style={{ padding: 48, textAlign: 'center' }}>Loading…</div>}>
      <RegisterContent />
    </Suspense>
  );
}
