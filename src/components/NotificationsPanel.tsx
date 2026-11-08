'use client';

import Link from 'next/link';
import { Button, Empty, List, Space, Tag, Typography } from 'antd';
import { CheckCheck } from 'lucide-react';
import type { NotificationItem } from '@/mock/types';
import { formatDate } from '@/lib/format';

const { Text } = Typography;

interface NotificationsPanelProps {
  notifications: NotificationItem[];
  onMarkRead: (notificationId: string) => void;
  onMarkAllRead: () => void;
  compact?: boolean;
}

export default function NotificationsPanel({
  notifications,
  onMarkRead,
  onMarkAllRead,
  compact = false,
}: NotificationsPanelProps) {
  const unreadCount = notifications.filter((item) => !item.read).length;
  const visibleNotifications = compact ? notifications.slice(0, 5) : notifications;

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Text type="secondary">
          {unreadCount ? `${unreadCount} unread` : 'You are all caught up'}
        </Text>
        {unreadCount ? (
          <Button
            type="link"
            size="small"
            icon={<CheckCheck size={14} aria-hidden />}
            onClick={onMarkAllRead}
          >
            Mark all as read
          </Button>
        ) : null}
      </Space>

      {notifications.length ? (
        <List
          dataSource={visibleNotifications}
          renderItem={(notification) => (
            <List.Item style={{ paddingInline: 0 }}>
              <Link
                href={notification.href ?? '/notifications'}
                onClick={() => onMarkRead(notification.id)}
                style={{ display: 'block', width: '100%' }}
              >
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Space size={6} wrap>
                    <Text strong={!notification.read}>{notification.title}</Text>
                    {!notification.read ? <Tag color="blue">New</Tag> : null}
                  </Space>
                  <Text type="secondary">{notification.detail}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDate(notification.createdAt)}
                  </Text>
                </Space>
              </Link>
            </List.Item>
          )}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No notifications yet."
        />
      )}

      {compact ? (
        <Link href="/notifications" style={{ display: 'block', textAlign: 'center' }}>
          View all notifications
        </Link>
      ) : null}
    </Space>
  );
}