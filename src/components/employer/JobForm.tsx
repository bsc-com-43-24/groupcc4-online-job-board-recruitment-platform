'use client';

import { Button, Col, Form, Input, InputNumber, Row, Select, Space } from 'antd';
import type { Job, JobStatus, JobType, WorkMode } from '@/mock/types';

const JOB_TYPES: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const WORK_MODES: WorkMode[] = ['On-site', 'Hybrid', 'Remote'];

export interface JobFormValues {
  title: string;
  location: string;
  workMode: WorkMode;
  type: JobType;
  salaryMin: number | null;
  salaryMax: number | null;
  deadline: string;
  summary: string;
  description: string;
  responsibilities: string;
  qualifications: string;
  skills: string[];
}

interface JobFormProps {
  initialValues?: Job;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (values: JobFormValues, status: JobStatus) => void;
  onCancel?: () => void;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Create/edit form shared by the "post a job" page and the edit drawer, so the
 * same validation applies wherever a vacancy is written.
 */
export default function JobForm({
  initialValues,
  submitLabel = 'Publish vacancy',
  submitting = false,
  onSubmit,
  onCancel,
}: JobFormProps) {
  const [form] = Form.useForm<JobFormValues>();

  const initial = initialValues
    ? {
        title: initialValues.title,
        location: initialValues.location,
        workMode: initialValues.workMode,
        type: initialValues.type,
        salaryMin: initialValues.salaryMin,
        salaryMax: initialValues.salaryMax,
        deadline: initialValues.deadline,
        summary: initialValues.summary,
        description: initialValues.description,
        responsibilities: initialValues.responsibilities.join('\n'),
        qualifications: initialValues.qualifications.join('\n'),
        skills: initialValues.skills,
      }
    : {
        workMode: 'On-site' as WorkMode,
        type: 'Full-time' as JobType,
        skills: [] as string[],
        deadline: '',
      };

  const submitWithStatus = async (status: JobStatus) => {
    const values = await form.validateFields();
    onSubmit(values, status);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initial}
      requiredMark="optional"
      onFinish={() => submitWithStatus('Active')}
    >
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

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name="workMode" label="Work mode" rules={[{ required: true }]}>
            <Select
              size="large"
              options={WORK_MODES.map((value) => ({ value, label: value }))}
              aria-label="Work mode"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="type" label="Contract type" rules={[{ required: true }]}>
            <Select
              size="large"
              options={JOB_TYPES.map((value) => ({ value, label: value }))}
              aria-label="Contract type"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
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
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="salaryMin"
            label="Minimum salary (MWK per month)"
            rules={[{ required: true, message: 'Enter the lower salary bound' }]}
          >
            <InputNumber
              size="large"
              style={{ width: '100%' }}
              min={0}
              step={50000}
              placeholder="e.g. 1500000"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="salaryMax"
            label="Maximum salary (MWK per month)"
            dependencies={['salaryMin']}
            rules={[
              { required: true, message: 'Enter the upper salary bound' },
              ({ getFieldValue }) => ({
                validator: (_, value: number | null) => {
                  const min = getFieldValue('salaryMin') as number | null;
                  if (value == null || min == null || value >= min) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error('The maximum must be at least the minimum'),
                  );
                },
              }),
            ]}
          >
            <InputNumber
              size="large"
              style={{ width: '100%' }}
              min={0}
              step={50000}
              placeholder="e.g. 2500000"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="summary"
        label="Short summary"
        extra="Shown on the job card. Keep it to one sentence."
        rules={[{ required: true, whitespace: true, message: 'Add a short summary' }]}
      >
        <Input size="large" maxLength={140} showCount />
      </Form.Item>

      <Form.Item
        name="description"
        label="Full description"
        rules={[{ required: true, whitespace: true, message: 'Describe the role' }]}
      >
        <Input.TextArea rows={5} maxLength={3000} showCount />
      </Form.Item>

      <Form.Item
        name="responsibilities"
        label="Responsibilities"
        extra="One per line."
      >
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
        <Button type="primary" htmlType="submit" size="large" loading={submitting}>
          {submitLabel}
        </Button>
        <Button
          size="large"
          disabled={submitting}
          onClick={() => submitWithStatus('Draft')}
        >
          Save as draft
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

/** Converts textarea input into a clean string array. */
export function toLines(value: string | undefined): string[] {
  return (value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Maps validated form values onto the fields a `Job` record stores. */
export function toJobPatch(values: JobFormValues, status: JobStatus) {
  return {
    title: values.title.trim(),
    location: values.location.trim(),
    workMode: values.workMode,
    type: values.type,
    salaryMin: Number(values.salaryMin ?? 0),
    salaryMax: Number(values.salaryMax ?? 0),
    deadline: values.deadline,
    summary: values.summary.trim(),
    description: values.description.trim(),
    responsibilities: toLines(values.responsibilities),
    qualifications: toLines(values.qualifications),
    skills: values.skills ?? [],
    status,
  };
}
