'use client';

import { Descriptions, Tag, Typography } from 'antd';
import type { Interview } from '@/mock/types';
import { formatDate } from '@/lib/format';

const { Link, Text } = Typography;

export default function InterviewDetails({ interview }: { interview: Interview }) {
  return (
    <Descriptions
      column={1}
      size="small"
      bordered
      items={[
        {
          key: 'status',
          label: 'Status',
          children: (
            <Tag color={interview.status === 'Scheduled' ? 'blue' : 'default'}>
              {interview.status}
            </Tag>
          ),
        },
        { key: 'date', label: 'Date', children: formatDate(interview.date) },
        { key: 'time', label: 'Time', children: interview.time },
        { key: 'mode', label: 'Mode', children: interview.mode },
        ...(interview.mode === 'Online'
          ? [
              {
                key: 'meetingLink',
                label: 'Meeting link',
                children: interview.meetingLink ? (
                  <Link href={interview.meetingLink} target="_blank" rel="noreferrer">
                    Join interview
                  </Link>
                ) : (
                  <Text type="secondary">Not provided</Text>
                ),
              },
            ]
          : [
              {
                key: 'location',
                label: 'Location',
                children: interview.location ?? 'Not provided',
              },
            ]),
        ...(interview.notes
          ? [{ key: 'notes', label: 'Notes', children: interview.notes }]
          : []),
      ]}
    />
  );
}
