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
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { BankOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { authService } from '@/services/authService';
import type { Role } from '@/mock/types';
import { roleHome, safeNextPath } from '@/services/session';
import { demoAccounts } from '@/mock/seed';

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

  const handleFinish = async (values: LoginValues) => {
    setLoading(true);
    setError(null);

    const result = await authService.login({
      email: values.email,
      password: values.password,
      role: activeRole,
    });

    setLoading(false);

    if (!result.success || !result.user) {
      setError(result.message);
      return;
    }

    message.success(`Welcome back, ${result.user.name.split(' ')[0]}.`);

    const next = safeNextPath(searchParams.get('next'));
    router.replace(next ?? roleHome(result.user.role));
    router.refresh();
  };

  const fillDemoCredentials = () => {
    const demo = demoAccounts.find((account) => account.role === activeRole);
    if (!demo) {
      return;
    }
    form.setFieldsValue({ email: demo.email, password: demo.password });
    setError(null);
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
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Title level={3} style={{ marginBottom: 6 }}>
            Welcome back
          </Title>
          <Text type="secondary">
            Sign in to your {activeRole === 'SEEKER' ? 'job seeker' : 'employer'} account
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

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            style={{ marginTop: 4 }}
          >
            Log in as {activeRole === 'SEEKER' ? 'Job Seeker' : 'Employer'}
          </Button>
        </Form>

        <Divider style={{ margin: '20px 0' }} />

        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          <Space size={8} wrap style={{ justifyContent: 'center' }}>
            <Text type="secondary">Demo account:</Text>
            <Tag>{demoAccounts.find((account) => account.role === activeRole)?.email}</Tag>
            <Tag>Demo1234</Tag>
          </Space>
          <Button block onClick={fillDemoCredentials}>
            Fill demo credentials
          </Button>
          <Text type="secondary" style={{ textAlign: 'center', display: 'block', fontSize: 13 }}>
            This frontend demo keeps accounts in your browser only.
          </Text>
        </Space>

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
    <Suspense fallback={<div style={{ padding: 48, textAlign: 'center' }}>Loading…</div>}>
      <LoginContent />
    </Suspense>
  );
}
