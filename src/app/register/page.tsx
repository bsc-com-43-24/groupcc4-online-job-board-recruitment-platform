'use client';

import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Typography,
  message,
  Divider,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  BankOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService, persistAuthSession } from '@/services/authService';

const { Title, Text } = Typography;

export type UserRole = 'SEEKER' | 'EMPLOYER';

export default function RegisterPage() {
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
      ...(activeRole === 'SEEKER'
        ? { fullName: values.fullName }
        : { companyName: values.companyName, contactName: values.contactName }),
    };

    try {
      const result = await authService.register(payload as any);

      if (result.success) {
        persistAuthSession(result.user, result.token);
        messageApi.success('Registration successful! Redirecting...');

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
        err.message || 'Registration failed. Please check your credentials and try again.'
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
          maxWidth: 460,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          borderRadius: 12,
        }}
      >
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            Create an Account
          </Title>
          <Text type="secondary">
            Sign up to start applying or post job vacancies
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
          {/* Seeker Field: Full Name */}
          {activeRole === 'SEEKER' && (
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[
                { required: true, whitespace: true, message: 'Please enter your full name' },
                { min: 2, message: 'Full name must be at least 2 characters long' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="e.g. John Banda"
                size="large"
              />
            </Form.Item>
          )}

          {/* Employer Fields: Company Name & Contact Person */}
          {activeRole === 'EMPLOYER' && (
            <>
              <Form.Item
                name="companyName"
                label="Company Name"
                rules={[{ required: true, whitespace: true, message: 'Please enter company name' }]}
              >
                <Input
                  prefix={<BankOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="e.g. TechCorp Solutions"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="contactName"
                label="Contact Person (Full Name)"
                rules={[{ required: true, whitespace: true, message: 'Please enter contact person name' }]}
              >
                <Input
                  prefix={<UserAddOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="e.g. Jane Doe"
                  size="large"
                />
              </Form.Item>
            </>
          )}

          {/* Common Field: Email */}
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

          {/* Common Field: Password */}
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 8, message: 'Password must be at least 8 characters long' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="At least 8 characters"
              size="large"
            />
          </Form.Item>

          {/* Common Field: Confirm Password */}
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Re-enter password"
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
            Register as {activeRole === 'SEEKER' ? 'Job Seeker' : 'Employer'}
          </Button>
        </Form>

        <Divider style={{ margin: '20px 0' }} />

        {/* Link to Login Page */}
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">Already have an account? </Text>
          <Link href="/login" style={{ fontWeight: 600 }}>
            Log In
          </Link>
        </div>
      </Card>
    </div>
  );
}