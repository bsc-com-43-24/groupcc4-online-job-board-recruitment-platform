'use client';

import { Alert, Button, Col, Form, Input, Row, Select, Space } from 'antd';
import type { CompanyView, Job, JobCategory, JobType, WorkMode } from '@/mock/types';

export interface JobFormValues {
  companyId: string;
  title: string;
  location: string;
  deadline: string;
  description: string;
  responsibilities: string;
  qualifications: string;
  skills: string[];
}

interface JobFormProps {
  companies: CompanyView[];
  initialValues?: Job;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (values: JobFormValues) => void | Promise<void>;
  onCancel?: () => void;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function JobForm({
  companies,
  initialValues,
  submitLabel = 'Publish vacancy',
  submitting = false,
  onSubmit,
  onCancel,
}: JobFormProps) {
  const [form] = Form.useForm<JobFormValues>();

  const initial: JobFormValues = {
    companyId: initialValues?.companyId ?? companies[0]?.id ?? '',
    title: initialValues?.title ?? '',
    location: initialValues?.location ?? '',
    deadline: initialValues?.deadline ?? '',
    description: initialValues?.description ?? '',
    responsibilities: initialValues?.responsibilities.join('\n') ?? '',
    qualifications: initialValues?.qualifications.join('\n') ?? '',
    skills: initialValues?.skills ?? [],
  };

  const submit = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initial}
      requiredMark="optional"
      onFinish={() => void submit()}
    >
      {companies.length === 0 ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          title="Create a company first"
          description="The recruitment API requires a company before you can post a vacancy."
        />
      ) : null}

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        title="Supported vacancy fields"
        description="The API stores a title, company, location, deadline, description and qualifications. Category, work mode, contract type and salary are not available and are not shown."
      />

      <Form.Item
        name="companyId"
        label="Company"
        rules={[{ required: true, message: 'Choose a company' }]}
      >
        <Select
          size="large"
          disabled={companies.length === 0}
          options={companies.map((company) => ({ value: company.id, label: company.name }))}
          placeholder="Select a company"
          aria-label="Company"
        />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} md={16}>
          <Form.Item
            name="title"
            label="Job title"
            rules={[{ required: true, whitespace: true, message: 'Enter a job title' }]}
          >
            <Input size="large" placeholder="e.g. Senior Full Stack Developer" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, whitespace: true, message: 'Enter a location' }]}
          >
            <Input size="large" placeholder="e.g. Blantyre, Malawi" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="deadline"
        label="Application deadline"
        rules={[
          { required: true, message: 'Choose a deadline' },
          {
            validator: (_, value: string) =>
              !value || value >= todayISO()
                ? Promise.resolve()
                : Promise.reject(new Error('The deadline must be today or later')),
          },
        ]}
      >
        <Input type="date" size="large" min={todayISO()} />
      </Form.Item>

      <Form.Item
        name="description"
        label="Full description"
        rules={[{ required: true, whitespace: true, message: 'Describe the role' }]}
      >
        <Input.TextArea rows={5} maxLength={10000} showCount />
      </Form.Item>

      <Form.Item name="responsibilities" label="Responsibilities" extra="One per line.">
        <Input.TextArea rows={4} placeholder={'Own features end to end\nReview code'} />
      </Form.Item>

      <Form.Item
        name="qualifications"
        label="Qualifications and requirements"
        extra="One per line."
      >
        <Input.TextArea rows={4} placeholder={'Degree in Computer Science\n3+ years of React'} />
      </Form.Item>

      <Form.Item name="skills" label="Skills" extra="Press Enter after each skill.">
        <Select
          mode="tags"
          size="large"
          tokenSeparators={[',']}
          placeholder="e.g. React, TypeScript, SQL"
          aria-label="Required skills"
        />
      </Form.Item>

      <Space wrap>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={submitting}
          disabled={companies.length === 0}
        >
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button size="large" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        ) : null}
      </Space>
    </Form>
  );
}

export function toLines(value: string | undefined): string[] {
  return (value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function toJobPatch(values: JobFormValues) {
  const description = values.description.trim();
  const responsibilities = toLines(values.responsibilities);
  const qualifications = toLines(values.qualifications);
  const skills = values.skills ?? [];

  return {
    employerId: '',
    company: '',
    companyId: values.companyId,
    title: values.title.trim(),
    location: values.location.trim(),
    category: 'Technology' as JobCategory,
    workMode: 'On-site' as WorkMode,
    type: 'Full-time' as JobType,
    currency: 'MWK',
    salaryMin: 0,
    salaryMax: 0,
    summary: description.split('\n')[0]?.slice(0, 220) ?? values.title.trim(),
    description: [
      description,
      responsibilities.length ? `Responsibilities:\n${responsibilities.map((item) => `- ${item}`).join('\n')}` : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
    responsibilities,
    qualifications,
    skills,
    deadline: values.deadline,
    status: 'Active' as const,
  };
}
