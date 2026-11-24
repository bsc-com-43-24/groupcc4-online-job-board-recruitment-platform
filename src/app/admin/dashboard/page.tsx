'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { TableProps } from 'antd';
import { apiErrorMessage, adminApi } from '@/services/api';
import { refreshAppData } from '@/mock/store';
import { useAdminUsers, useEmployerRequests } from '@/hooks/useStore';
import type { AdminUserView } from '@/mock/types';

const { Title, Paragraph } = Typography;

interface CreateUserValues {
  email: string;
  password: string;
  role: 'JOB_SEEKER' | 'EMPLOYER';
}

export default function AdminDashboardPage() {
  const users = useAdminUsers();
  const requests = useEmployerRequests();
  const { message } = AntApp.useApp();
  const [form] = Form.useForm<CreateUserValues>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAction = async (action: () => Promise<unknown>, success: string) => {
    setError(null);
    try {
      await action();
      await refreshAppData();
      message.success(success);
    } catch (actionError) {
      setError(apiErrorMessage(actionError));
    }
  };

  const handleCreate = async (values: CreateUserValues) => {
    setLoading(true);
    await runAction(
      () => adminApi.createUser(values),
      'Account created.',
    );
    setLoading(false);
    form.resetFields();
  };

  const columns: TableProps<AdminUserView>['columns'] = [
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: AdminUserView['role']) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'accountStatus',
      key: 'accountStatus',
      render: (status: AdminUserView['accountStatus']) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, user) => (
        <Space wrap>
          {user.role !== 'ADMIN' ? (
            <Popconfirm
              title="Grant administrator access?"
              onConfirm={() =>
                void runAction(() => adminApi.assignAdmin(user.id), 'Administrator role assigned.')
              }
            >
              <Button size="small">Make admin</Button>
            </Popconfirm>
          ) : null}
          {user.accountStatus === 'ACTIVE' ? (
            <Popconfirm
              title="Suspend this account?"
              onConfirm={() =>
                void runAction(() => adminApi.suspendUser(user.id), 'Account suspended.')
              }
            >
              <Button size="small" danger>
                Suspend
              </Button>
            </Popconfirm>
          ) : null}
          <Popconfirm
            title="Remove this account?"
            onConfirm={() =>
              void runAction(() => adminApi.removeUser(user.id), 'Account removed.')
            }
          >
            <Button size="small" danger>
              Remove
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '40px 16px', maxWidth: 1100, margin: '0 auto' }}>
      <Title level={2}>Admin dashboard</Title>
      <Paragraph type="secondary">Manage accounts and employer verification requests.</Paragraph>

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

      <Space size="large" style={{ marginBottom: 24 }}>
        <Card>
          <Statistic title="Accounts" value={users.length} />
        </Card>
        <Card>
          <Statistic title="Pending employer requests" value={requests.filter((item) => item.status === 'PENDING').length} />
        </Card>
        <Link href="/admin/employer-requests">
          <Button type="primary">Review requests</Button>
        </Link>
      </Space>

      <Card title="Create account" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password (12–72 characters)"
            rules={[
              { required: true, message: 'Enter a password' },
              { min: 12, message: 'Use at least 12 characters' },
              { max: 72, message: 'Use no more than 72 characters' },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'JOB_SEEKER', label: 'Job seeker' },
                { value: 'EMPLOYER', label: 'Employer' },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create account
          </Button>
        </Form>
      </Card>

      <Card title="Accounts">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={users}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 720 }}
        />
      </Card>
    </div>
  );
}
