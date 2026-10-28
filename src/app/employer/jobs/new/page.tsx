'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { App as AntApp, Button, Card, Skeleton, Space, Typography } from 'antd';
import { ArrowLeft } from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import JobForm, { toJobPatch } from '@/components/employer/JobForm';
import type { JobFormValues } from '@/components/employer/JobForm';
import { useHydrated } from '@/hooks/useHydrated';
import { useMockState } from '@/hooks/useStore';
import { createJob } from '@/mock/store';
import { useSession } from '@/services/session';
import type { JobStatus } from '@/mock/types';

const { Title, Text } = Typography;

export default function NewEmployerJobPage() {
  const hydrated = useHydrated();
  const session = useSession();
  const router = useRouter();
  const { message } = AntApp.useApp();
  const accounts = useMockState().accounts;
  const [saving, setSaving] = useState(false);

  const companyName = useMemo(
    () =>
      accounts.find((account) => account.email === session?.email)?.companyName ??
      session?.name ??
      'Your company',
    [accounts, session],
  );

  if (!hydrated || !session) {
    return (
      <PageContainer maxWidth={880}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </PageContainer>
    );
  }

  const handleSubmit = (values: JobFormValues, status: JobStatus) => {
    setSaving(true);

    const job = createJob({
      employerId: session.userId,
      company: companyName,
      currency: 'MWK',
      ...toJobPatch(values, status),
    });

    setSaving(false);
    message.success(
      status === 'Draft'
        ? 'Vacancy saved as a draft. Publish it when you are ready.'
        : 'Vacancy published and visible to job seekers.',
    );
    router.push(`/employer/jobs/${job.id}`);
  };

  return (
    <PageContainer maxWidth={880}>
      <Space style={{ marginBottom: 16 }} wrap>
        <Link href="/employer/jobs">
          <Button icon={<ArrowLeft size={16} aria-hidden />}>Back to my jobs</Button>
        </Link>
      </Space>

      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          Post a vacancy
        </Title>
        <Text type="secondary">
          Publishing makes the role visible on the public job board immediately.
        </Text>
      </div>

      <Card>
        <JobForm submitLabel="Publish vacancy" submitting={saving} onSubmit={handleSubmit} />
      </Card>
    </PageContainer>
  );
}
