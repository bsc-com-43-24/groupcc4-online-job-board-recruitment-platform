'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, App as AntApp, Button, Card, Space, Typography } from 'antd';
import { ArrowLeft } from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import PageSkeleton from '@/components/ui/PageSkeleton';
import JobForm, { toJobPatch } from '@/components/employer/JobForm';
import type { JobFormValues } from '@/components/employer/JobForm';
import { useHydrated } from '@/hooks/useHydrated';
import { useCompanies, useMockState } from '@/hooks/useStore';
import { createJob } from '@/mock/store';
import { apiErrorMessage } from '@/services/api';
import { useSession } from '@/services/session';

const { Title, Text } = Typography;

export default function NewEmployerJobPage() {
  const hydrated = useHydrated();
  const session = useSession();
  const router = useRouter();
  const { message } = AntApp.useApp();
  const companies = useCompanies();
  const state = useMockState();
  const [saving, setSaving] = useState(false);

  if (!hydrated || !session) {
    return (
      <PageContainer maxWidth={880}>
        <PageSkeleton rows={10} />
      </PageContainer>
    );
  }

  const handleSubmit = async (values: JobFormValues) => {
    setSaving(true);
    try {
      const job = await createJob({
        ...toJobPatch(values),
        employerId: session.userId,
        company: companies.find((company) => company.id === values.companyId)?.name ?? 'Employer',
        currency: 'MWK',
      });
      message.success('Vacancy published and visible to job seekers.');
      router.push(`/employer/jobs/${job.id}`);
    } catch (createError) {
      message.error(apiErrorMessage(createError));
    } finally {
      setSaving(false);
    }
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

      {state.error ? (
        <Alert type="error" showIcon title={state.error} style={{ marginBottom: 16 }} />
      ) : null}

      <Card>
        <JobForm
          companies={companies}
          submitLabel="Publish vacancy"
          submitting={saving}
          onSubmit={handleSubmit}
        />
      </Card>
    </PageContainer>
  );
}
