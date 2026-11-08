'use client';

import dayjs, { type Dayjs } from 'dayjs';
import { Alert, Button, DatePicker, Form, Input, Modal, Radio, Space, TimePicker } from 'antd';
import type { Interview } from '@/mock/types';

const { TextArea } = Input;

interface InterviewFormValues {
  date: Dayjs;
  time: Dayjs;
  mode: Interview['mode'];
  location?: string;
  meetingLink?: string;
  notes?: string;
}

interface InterviewFormProps {
  open: boolean;
  applicantName: string;
  interview?: Interview;
  onClose: () => void;
  onSave: (interview: Omit<Interview, 'status'>) => boolean;
}

export default function InterviewForm({
  open,
  applicantName,
  interview,
  onClose,
  onSave,
}: InterviewFormProps) {
  const [form] = Form.useForm<InterviewFormValues>();
  const mode = Form.useWatch('mode', form) ?? interview?.mode ?? 'Online';

  const isFutureDateTime = () => {
    const date = form.getFieldValue('date');
    const time = form.getFieldValue('time');
    if (!date || !time) {
      return true;
    }

    return new Date(
      `${date.format('YYYY-MM-DD')}T${time.format('HH:mm')}:00`,
    ).getTime() > Date.now();
  };

  const handleFinish = (values: InterviewFormValues) => {
    const date = values.date.format('YYYY-MM-DD');
    const time = values.time.format('HH:mm');
    if (!isFutureDateTime()) {
      form.setFields([
        { name: 'date', errors: ['Choose a future date and time.'] },
        { name: 'time', errors: ['Choose a future date and time.'] },
      ]);
      return;
    }

    const saved = onSave({
      date,
      time,
      mode: values.mode,
      ...(values.mode === 'Online'
        ? { meetingLink: values.meetingLink?.trim() }
        : { location: values.location?.trim() }),
      notes: values.notes?.trim() || undefined,
    });

    if (saved) {
      form.resetFields();
      onClose();
    } else {
      form.setFields([
        { name: 'date', errors: ['This application or interview changed. Refresh and try again.'] },
      ]);
    }
  };

  return (
    <Modal
      title={`${interview?.status === 'Scheduled' ? 'Edit' : 'Schedule'} interview`}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Alert
        type="info"
        showIcon
        message={`Interview with ${applicantName}`}
        description="Only future interview dates and times can be saved."
        style={{ marginBottom: 20 }}
      />
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          date: interview ? dayjs(interview.date) : undefined,
          time: interview ? dayjs(`2000-01-01T${interview.time}`) : undefined,
          mode: interview?.mode ?? 'Online',
          location: interview?.location,
          meetingLink: interview?.meetingLink,
          notes: interview?.notes,
        }}
        onFinish={handleFinish}
      >
        <Space align="start" size={12} style={{ display: 'flex' }} wrap>
          <Form.Item
            name="date"
            label="Date"
            rules={[
              { required: true, message: 'Choose an interview date.' },
              {
                validator: async () => {
                  if (!isFutureDateTime()) {
                    throw new Error('Choose a future date and time.');
                  }
                },
              },
            ]}
          >
            <DatePicker
              format="DD MMM YYYY"
              disabledDate={(current) => current.endOf('day').isBefore(dayjs())}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="time"
            label="Time"
            rules={[
              { required: true, message: 'Choose an interview time.' },
              {
                validator: async () => {
                  if (!isFutureDateTime()) {
                    throw new Error('Choose a future date and time.');
                  }
                },
              },
            ]}
          >
            <TimePicker format="HH:mm" minuteStep={5} style={{ width: '100%' }} />
          </Form.Item>
        </Space>

        <Form.Item name="mode" label="Mode" rules={[{ required: true }]}>
          <Radio.Group
            options={[
              { label: 'Online', value: 'Online' },
              { label: 'In person', value: 'In person' },
            ]}
            optionType="button"
            buttonStyle="solid"
          />
        </Form.Item>

        {mode === 'Online' ? (
          <Form.Item
            name="meetingLink"
            label="Meeting link"
            preserve={false}
            rules={[
              { required: true, message: 'Enter the online meeting link.' },
              { type: 'url', message: 'Enter a valid URL, including https://.' },
            ]}
          >
            <Input placeholder="https://..." autoComplete="url" />
          </Form.Item>
        ) : (
          <Form.Item
            name="location"
            label="Location"
            preserve={false}
            rules={[{ required: true, whitespace: true, message: 'Enter the interview location.' }]}
          >
            <Input placeholder="Address or venue" />
          </Form.Item>
        )}

        <Form.Item name="notes" label="Notes">
          <TextArea rows={3} maxLength={1000} showCount placeholder="Optional details for the applicant" />
        </Form.Item>

        <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {interview?.status === 'Scheduled' ? 'Save changes' : 'Schedule interview'}
          </Button>
        </Space>
      </Form>
    </Modal>
  );
}
