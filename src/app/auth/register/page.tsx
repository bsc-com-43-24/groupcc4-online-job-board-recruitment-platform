'use client';

import { Button, Card, Form, Input, Radio, Typography } from 'antd';
import Link from 'next/link';

type RegistrationFormValues = {
  name: string;
  email: string;
  password: string;
  accountType: 'job seeker' | 'employer';
};

export default function RegisterPage() {
  const onFinish = (_values: RegistrationFormValues) => {
    // Registration is not connected to a backend yet.
  };

  return (
    <div style={{ maxWidth: 440, margin: '40px auto' }}>
      <Card>
        <Typography.Title level={2} style={{ marginTop: 0 }}>
          Create an account
        </Typography.Title>
        <Typography.Paragraph>
          Register as a job seeker or employer.
        </Typography.Paragraph>

        <Form<RegistrationFormValues>
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ accountType: 'job seeker' }}
          requiredMark={false}
        >
          <Form.Item label="I am a" name="accountType">
            <Radio.Group optionType="button" buttonStyle="solid">
              <Radio.Button value="job seeker">Job seeker</Radio.Button>
              <Radio.Button value="employer">Employer</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="Full name"
            name="name"
            rules={[{ required: true, message: 'Please enter your name.' }]}
          >
            <Input autoComplete="name" />
          </Form.Item>
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
            rules={[{ required: true, message: 'Please create a password.' }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Register
          </Button>
        </Form>

        <Typography.Paragraph style={{ textAlign: 'center', margin: '20px 0 0' }}>
          Already registered? <Link href="/auth/login">Log in</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
