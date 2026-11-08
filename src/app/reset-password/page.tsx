'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { authService } from '@/services/authService';

const { Title, Text } = Typography;

interface ResetPasswordValues {
  password: string;
  confirmPassword: string;
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm<ResetPasswordValues>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = searchParams.get('token');

  const handleFinish = async (values: ResetPasswordValues) => {
    if (!token) {
      setError('This reset link is invalid or expired. Request a new one to continue.');
      return;
    }

    setLoading(true);
    setError(null);
    const result = await authService.resetPassword({ token, password: values.password });
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    router.replace('/login?reset=success');
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
      <Card style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 6 }}>
            Set a new password
          </Title>
          <Text type="secondary">Choose a password with at least 8 characters.</Text>
        </div>

        {!token ? (
          <Alert
            type="error"
            showIcon
            message="This reset link is invalid or expired."
            description={
              <Link href="/forgot-password">Request a new reset link</Link>
            }
          />
        ) : (
          <>
            {error ? (
              <Alert
                type="error"
                showIcon
                message={error}
                description={
                  <Link href="/forgot-password">Request a new reset link</Link>
                }
                style={{ marginBottom: 16 }}
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
                name="password"
                label="New password"
                rules={[
                  { required: true, message: 'Enter a new password' },
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
                label="Confirm new password"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Confirm your new password' },
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
                  placeholder="Re-enter your new password"
                  size="large"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                Reset password
              </Button>
            </Form>
          </>
        )}

        <Space style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <Link href="/login">Back to login</Link>
        </Space>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: 48, textAlign: 'center' }}>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}