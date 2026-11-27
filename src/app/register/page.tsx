'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Input,
  Typography,
} from 'antd';
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { authService } from '@/services/authService';
import ProtectedRoute from '@/components/ProtectedRoute';

const { Title, Text } = Typography;

interface RegisterValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

function RegisterContent() {
  const { message } = AntApp.useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async (values: RegisterValues) => {
    setLoading(true);
    setError(null);

    const result = await authService.register({
      email: values.email,
      password: values.password,
      role: 'JOB_SEEKER',
      name: values.fullName,
    });

    if (!result.success || !result.user) {
      setLoading(false);
      setError(result.message);
      return;
    }

    setLoading(false);
    message.success('Account created. Welcome aboard!');
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
            Create a job seeker account
          </Title>
          <Text type="secondary">
            Register as a job seeker to apply for open roles.
          </Text>
        </div>

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

        <Form
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
          disabled={loading}
        >
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
            Register as Job Seeker
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
      <RegisterContent />
    </ProtectedRoute>
  );
}
