import { Tag } from 'antd';
import type { ApplicationStatus, JobStatus } from '@/mock/types';

const APPLICATION_COLORS: Record<ApplicationStatus, string> = {
  Submitted: 'default',
  'Under Review': 'gold',
  Shortlisted: 'blue',
  Interviewed: 'purple',
  Hired: 'green',
  Rejected: 'red',
};

const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  Draft: 'default',
  Active: 'green',
  Closed: 'red',
};

/**
 * One place that decides how a status is worded and coloured, so the same
 * application never appears as "Pending" on one screen and "Submitted" on
 * another.
 */
export function ApplicationStatusTag({ status }: { status: ApplicationStatus }) {
  return <Tag color={APPLICATION_COLORS[status]}>{status}</Tag>;
}

export function JobStatusTag({ status }: { status: JobStatus }) {
  return <Tag color={JOB_STATUS_COLORS[status]}>{status}</Tag>;
}
