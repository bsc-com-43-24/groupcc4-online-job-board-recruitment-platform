'use client';

import { useState } from 'react';
import { Button, Card, Form, Input, Radio, Typography } from 'antd';
import Link from 'next/link';

type LoginFormValues = {
  email: string;
  password: string;
};

export default function JobSeekerLoginPage() {
  const [accountType, setAccountType] = useState<'job seeker' | 'employer'>('job seeker');
  const onFinish = (_values: LoginFormValues) => {
    // Authentication is outside the scope of this frontend validation form.
  };

  return (
    <div style={{ maxWidth: 440, margin: '40px auto' }}>
      <Card>
        <Typography.Title level={2} style={{ marginTop: 0 }}>
          Log in as a {accountType}
        </Typography.Title>
        <Typography.Paragraph>
          Choose your account type, then sign in with your email address and password.
        </Typography.Paragraph>

        <Radio.Group
          aria-label="Account type"
          optionType="button"
          buttonStyle="solid"
          value={accountType}
          onChange={(event) => setAccountType(event.target.value)}
          style={{ display: 'flex', marginBottom: 24 }}
        >
          <Radio.Button value="job seeker" style={{ flex: 1, textAlign: 'center' }}>
            Job seeker
          </Radio.Button>
          <Radio.Button value="employer" style={{ flex: 1, textAlign: 'center' }}>
            Employer
          </Radio.Button>
        </Radio.Group>

        <Form<LoginFormValues>
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            label="Email address"
            name="email"
            rules={[
              { required: true, whitespace: true, message: 'Please enter your email address.' },
              { type: 'email', message: 'Please enter a valid email address.' },
            ]}
          >
            <Input type="email" autoComplete="email" placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password.' }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Log in as {accountType}
          </Button>
        </Form>

        <Typography.Paragraph style={{ textAlign: 'center', margin: '20px 0 0' }}>
          Haven&apos;t registered yet? <Link href="/auth/register">Register</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
