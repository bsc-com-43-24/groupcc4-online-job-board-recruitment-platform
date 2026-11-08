'use client';

import Link from 'next/link';
import { Button, Card, Result, Skeleton, Space, Typography } from 'antd';
import PageContainer from '@/components/PageContainer';
import NotificationsPanel from '@/components/NotificationsPanel';
import { useHydrated } from '@/hooks/useHydrated';
import { useNotifications } from '@/hooks/useStore';
import { markNotificationRead, markNotificationsRead } from '@/mock/store';
import { useSession } from '@/services/session';

const { Title, Text } = Typography;

export default function NotificationsPage() {
  const hydrated = useHydrated();
  const session = useSession();
  const notifications = useNotifications(session?.userId);

  if (!hydrated) {
    return (
      <PageContainer maxWidth={900}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </PageContainer>
    );
  }

  if (!session) {
    return (
      <PageContainer maxWidth={680}>
        <Result
          status="403"
          title="Sign in to view notifications"
          extra={
            <Link href="/login?next=%2Fnotifications">
              <Button type="primary">Log in</Button>
            </Link>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={900}>
      <Space direction="vertical" size={4} style={{ marginBottom: 20 }}>
        <Title level={2} style={{ margin: 0 }}>
          Notifications
        </Title>
        <Text type="secondary">Updates about your applications and vacancies.</Text>
      </Space>
      <Card>
        <NotificationsPanel
          notifications={notifications}
          onMarkRead={(id) => markNotificationRead(session.userId, id)}
          onMarkAllRead={() => markNotificationsRead(session.userId)}
        />
      </Card>
    </PageContainer>
  );
}