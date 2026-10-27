'use client';

import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, BankOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService, persistAuthSession } from '@/services/authService';

const { Title, Text } = Typography;

export type UserRole = 'SEEKER' | 'EMPLOYER';

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState<UserRole>('SEEKER');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const handleRoleChange = (key: string) => {
    setActiveRole(key as UserRole);
    form.resetFields();
  };

  const handleFinish = async (values: Record<string, string>) => {
    setLoading(true);

    const payload = {
      role: activeRole,
      email: values.email,
      password: values.password,
    };

    try {
      const result = await authService.login(payload);

      if (result.success) {
        persistAuthSession(result.user, result.token);
        messageApi.success('Login successful! Redirecting...');

        setTimeout(() => {
          if (activeRole === 'EMPLOYER') {
            router.push('/employer/jobs');
          } else {
            router.push('/job-seeker/home');
          }
        }, 1000);
      }
    } catch (err: any) {
      console.error(err);
      messageApi.error(
        err.message || 'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 16px',
      }}
    >
      {contextHolder}

      <Card
        variant="borderless"
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          borderRadius: 12,
        }}
      >
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            Welcome Back
          </Title>
          <Text type="secondary">
            Sign in to access your {activeRole === 'SEEKER' ? 'job seeker' : 'employer'} portal
          </Text>
        </div>

        {/* Role Toggle Tabs */}
        <Tabs
          activeKey={activeRole}
          onChange={handleRoleChange}
          centered
          items={[
            {
              key: 'SEEKER',
              label: (
                <span>
                  <UserOutlined /> Job Seeker
                </span>
              ),
            },
            {
              key: 'EMPLOYER',
              label: (
                <span>
                  <BankOutlined /> Employer
                </span>
              ),
            },
          ]}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
          style={{ marginTop: 16 }}
        >
          {/* Email Address */}
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, whitespace: true, message: 'Please enter your email address' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="name@example.com"
              size="large"
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Enter password"
              size="large"
            />
          </Form.Item>

          {/* Submit Action */}
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            style={{ marginTop: 8 }}
          >
            Log In as {activeRole === 'SEEKER' ? 'Job Seeker' : 'Employer'}
          </Button>
        </Form>

        <Divider style={{ margin: '20px 0' }} />

        {/* Fixed Link to Registration Page */}
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">Don't have an account? </Text>
          <Link href="/register" style={{ fontWeight: 600 }}>
            Register Now
          </Link>
        </div>
      </Card>
    </div>
  );
}