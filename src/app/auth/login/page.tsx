'use client';

import { Button, Card, Form, Input, Typography } from 'antd';

type LoginFormValues = {
  email: string;
  password: string;
};

export default function JobSeekerLoginPage() {
  const onFinish = (_values: LoginFormValues) => {
    // Authentication is outside the scope of this frontend validation form.
  };

  return (
    <div style={{ maxWidth: 440, margin: '40px auto' }}>
      <Card>
        <Typography.Title level={2} style={{ marginTop: 0 }}>
          Job seeker login
        </Typography.Title>
        <Typography.Paragraph>
          Sign in with your email address and password.
        </Typography.Paragraph>

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
            Log in
          </Button>
        </Form>
      </Card>
    </div>
  );
}
