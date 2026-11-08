'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Divider,
  Form,
  Input,
  Space,
  Typography,
} from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { authService } from '@/services/authService';
import { roleHome, safeNextPath } from '@/services/session';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageSkeleton from '@/components/ui/PageSkeleton';

const { Title, Text } = Typography;

interface LoginValues {
  email: string;
  password: string;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = AntApp.useApp();
  const [form] = Form.useForm<LoginValues>();

  const resetSuccess = searchParams.get('reset') === 'success';
  const sessionExpired = searchParams.get('session') === 'expired';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAvailable, setRetryAvailable] = useState(false);

  const handleFinish = async (values: LoginValues) => {
    setLoading(true);
    setError(null);
    setRetryAvailable(false);

    try {
      const result = await authService.login({
        email: values.email,
        password: values.password,
      });

      if (!result.success || !result.user) {
        setError(result.message);
        setRetryAvailable(Boolean(result.networkError));
        return;
      }

      message.success(`Welcome back, ${result.user.name.split(' ')[0]}.`);

      const dashboard = roleHome(result.user.role);
      const next = safeNextPath(searchParams.get('next'));
      const rolePrefix = result.user.role === 'EMPLOYER' ? '/employer/' : '/seeker/';
      const destination =
        next && (next === dashboard || next.startsWith(rolePrefix))
          ? next
          : dashboard;
      router.replace(destination);
      router.refresh();
    } catch {
      setError('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '48px 16px',
        background: 'linear-gradient(135deg, #ffffff 0%, #eaf3ff 100%)',
      }}
    >
      <Card style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Title level={3} style={{ marginBottom: 6 }}>
            Welcome back
          </Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        {resetSuccess ? (
          <Alert
            type="success"
            showIcon
            message="Password reset successfully. Sign in with your new password."
            style={{ marginBottom: 16 }}
          />
        ) : null}

        {sessionExpired ? (
          <Alert
            type="warning"
            showIcon
            role="alert"
            message="Your session has expired, please log in again."
            style={{ marginBottom: 16 }}
          />
        ) : null}

        {error ? (
          <Alert
            type="error"
            showIcon
            message={error}
            action={
              retryAvailable ? (
                <Button
                  type="link"
                  size="small"
                  disabled={loading}
                  onClick={() => form.submit()}
                >
                  Retry
                </Button>
              ) : undefined
            }
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
            rules={[{ required: true, message: 'Enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined aria-hidden />}
              placeholder="Enter your password"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <div style={{ marginTop: -12, marginBottom: 12, textAlign: 'right' }}>
            <Link href="/forgot-password">Forgot password?</Link>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            style={{ marginTop: 4 }}
          >
            Log in
          </Button>
        </Form>

        <Divider style={{ margin: '20px 0' }} />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">Don&apos;t have an account? </Text>
          <Link href="/register" style={{ fontWeight: 600 }}>
            Register now
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ProtectedRoute guestOnly>
      <Suspense fallback={<PageSkeleton rows={5} />}>
        <LoginContent />
      </Suspense>
    </ProtectedRoute>
  );
}
