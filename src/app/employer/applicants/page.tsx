'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  Select,
  Space,
  Typography,
} from 'antd';
import { Users } from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import DeniedAlert from '@/components/DeniedAlert';
import EmptyState from '@/components/ui/EmptyState';
import PageSkeleton from '@/components/ui/PageSkeleton';
import ApplicantsTable from '@/components/employer/ApplicantsTable';
import { useHydrated } from '@/hooks/useHydrated';
import { useEmployerApplications, useEmployerJobs, useJobs } from '@/hooks/useStore';
import { useSession } from '@/services/session';

const { Title, Text } = Typography;

export default function EmployerApplicantsPage() {
  const hydrated = useHydrated();
  const session = useSession();
  const jobs = useEmployerJobs(session?.userId);
  const allJobs = useJobs();
  const applications = useEmployerApplications(session?.userId);
  const [jobFilter, setJobFilter] = useState<string>('all');

  const jobsById = useMemo(() => new Map(allJobs.map((job) => [job.id, job])), [allJobs]);

  const filtered = useMemo(
    () =>
      jobFilter === 'all'
        ? applications
        : applications.filter((application) => application.jobId === jobFilter),
    [applications, jobFilter],
  );

  if (!hydrated || !session) {
    return (
      <PageContainer maxWidth={1180}>
        <PageSkeleton rows={8} />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={1180}>
      <Suspense fallback={null}>
        <DeniedAlert />
      </Suspense>

      <Space
        style={{ justifyContent: 'space-between', width: '100%', marginBottom: 16 }}
        wrap
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Applicants
          </Title>
          <Text type="secondary">
            Review every application, filter by vacancy, and move candidates through
            shortlisting.
          </Text>
        </div>
        <Space wrap>
          <Select
            aria-label="Filter by vacancy"
            value={jobFilter}
            onChange={setJobFilter}
            style={{ width: 260 }}
            options={[
              { value: 'all', label: 'All vacancies' },
              ...jobs.map((job) => ({ value: job.id, label: job.title })),
            ]}
          />
        </Space>
      </Space>

      <Card>
        {applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Once someone applies to one of your vacancies, they appear here."
            action={
            <Link href="/employer/jobs">
              <Button type="primary" icon={<Users size={16} aria-hidden />}>
                View my vacancies
              </Button>
            </Link>
            }
          />
        ) : (
          <ApplicantsTable
            applications={filtered}
            jobsById={jobsById}
            showJob
            emptyDescription="No applicants match this vacancy."
          />
        )}
      </Card>
    </PageContainer>
  );
}
