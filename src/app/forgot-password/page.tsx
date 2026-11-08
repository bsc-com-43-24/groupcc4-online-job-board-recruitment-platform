'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { authService } from '@/services/authService';

const { Title, Text } = Typography;

interface ForgotPasswordValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const [form] = Form.useForm<ForgotPasswordValues>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleFinish = async (values: ForgotPasswordValues) => {
    setLoading(true);
    setError(null);
    setConfirmation(null);
    setResetUrl(null);

    const result = await authService.requestPasswordReset(values.email);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setConfirmation(result.message);
    setResetUrl(result.resetUrl ?? null);
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
            Forgot your password?
          </Title>
          <Text type="secondary">
            Enter your account email and we&apos;ll send instructions to reset your password.
          </Text>
        </div>

        {error ? (
          <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />
        ) : null}

        {confirmation ? (
          <Alert
            type="success"
            showIcon
            message={confirmation}
            description={
              resetUrl ? (
                <Space direction="vertical" size={4} style={{ marginTop: 8 }}>
                  <Text>
                    Email delivery is not configured in this browser demo. Use this demo reset link:
                  </Text>
                  <Link href={resetUrl}>Reset your password</Link>
                </Space>
              ) : null
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

          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            Send reset link
          </Button>
        </Form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link href="/login">Back to login</Link>
        </div>
      </Card>
    </div>
  );
}