'use client';

import { useState } from 'react';
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Descriptions,
  Drawer,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { TableProps } from 'antd';
import { apiErrorMessage, adminApi } from '@/services/api';
import { refreshAppData } from '@/mock/store';
import { useEmployerRequests } from '@/hooks/useStore';
import type { EmployerRequestView } from '@/mock/types';

const { Title, Paragraph, Text } = Typography;

export default function AdminEmployerRequestsPage() {
  const requests = useEmployerRequests();
  const { message } = AntApp.useApp();
  const [selected, setSelected] = useState<EmployerRequestView | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAction = async (action: () => Promise<unknown>, success: string) => {
    setLoading(true);
    setError(null);
    try {
      await action();
      await refreshAppData();
      setSelected(null);
      setRejectionReason('');
      message.success(success);
    } catch (actionError) {
      setError(apiErrorMessage(actionError));
    } finally {
      setLoading(false);
    }
  };

  const columns: TableProps<EmployerRequestView>['columns'] = [
    { title: 'Company', dataIndex: 'companyName', key: 'companyName' },
    { title: 'Contact', dataIndex: 'contactEmail', key: 'contactEmail' },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: EmployerRequestView['status']) => (
        <Tag
          color={
            status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'gold'
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, request) => (
        <Space>
          <Button size="small" onClick={() => setSelected(request)}>
            Review
          </Button>
          {request.status === 'PENDING' ? (
            <Popconfirm
              title="Approve this request?"
              onConfirm={() =>
                void runAction(
                  () => adminApi.approveEmployerRequest(request.id),
                  'Employer request approved.',
                )
              }
            >
              <Button size="small" type="primary" loading={loading}>
                Approve
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '40px 16px', maxWidth: 1100, margin: '0 auto' }}>
      <Title level={2}>Employer verification requests</Title>
      <Paragraph type="secondary">Review company documents and approve employer upgrades.</Paragraph>

      {error ? (
        <Alert
          type="error"
          showIcon
          title={error}
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setError(null)}
        />
      ) : null}

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={requests}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Drawer
        title={selected?.companyName ?? 'Request'}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        size={520}
      >
        {selected ? (
          <Space orientation="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Status">{selected.status}</Descriptions.Item>
              <Descriptions.Item label="Contact email">{selected.contactEmail}</Descriptions.Item>
              <Descriptions.Item label="Contact phone">{selected.contactPhone}</Descriptions.Item>
              <Descriptions.Item label="Location">{selected.location}</Descriptions.Item>
              <Descriptions.Item label="Registration number">
                {selected.registrationNumber}
              </Descriptions.Item>
              <Descriptions.Item label="VAT number">{selected.vatNumber}</Descriptions.Item>
              <Descriptions.Item label="Document">
                {selected.documentOriginalFilename ?? 'Not provided'}
              </Descriptions.Item>
              <Descriptions.Item label="Business description">
                {selected.businessDescription}
              </Descriptions.Item>
              {selected.rejectionReason ? (
                <Descriptions.Item label="Reviewer note">
                  {selected.rejectionReason}
                </Descriptions.Item>
              ) : null}
            </Descriptions>

            {selected.status === 'PENDING' ? (
              <>
                <div>
                  <Text strong>Rejection reason</Text>
                  <Input.TextArea
                    rows={3}
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    placeholder="Explain why the request cannot be approved"
                  />
                </div>
                <Space>
                  <Button
                    danger
                    loading={loading}
                    disabled={!rejectionReason.trim()}
                    onClick={() =>
                      void runAction(
                        () => adminApi.rejectEmployerRequest(selected.id, rejectionReason.trim()),
                        'Employer request rejected.',
                      )
                    }
                  >
                    Reject
                  </Button>
                </Space>
              </>
            ) : null}
          </Space>
        ) : null}
      </Drawer>
    </div>
  );
}
