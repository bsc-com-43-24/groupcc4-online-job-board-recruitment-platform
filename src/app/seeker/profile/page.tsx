'use client';

import { Suspense, useState } from 'react';
import {
  Alert,
  App as AntApp,
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  Progress,
  Row,
  Select,
  Space,
  Typography,
  Upload,
} from 'antd';
import type { UploadProps } from 'antd';
import { IdCard, Mail, MapPin, Phone, UploadCloud, UserRound } from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import DeniedAlert from '@/components/DeniedAlert';
import PageSkeleton from '@/components/ui/PageSkeleton';
import { useHydrated } from '@/hooks/useHydrated';
import { useProfile } from '@/hooks/useStore';
import { saveProfile } from '@/mock/store';
import { useSession } from '@/services/session';

const { Title, Text } = Typography;

const MAX_CV_BYTES = 5 * 1024 * 1024;
const MAX_PROFILE_PICTURE_BYTES = 1 * 1024 * 1024;
const PROFILE_PICTURE_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

interface ProfileFormValues {
  fullName: string;
  headline: string;
  phone: string;
  location: string;
  skills: string[];
  education: string;
  experience: string;
}

function completeness(values: {
  headline?: string;
  phone?: string;
  location?: string;
  skills?: string[];
  education?: string;
  experience?: string;
  cvName?: string | null;
}): number {
  const checks = [
    values.headline,
    values.phone,
    values.location,
    values.skills?.length,
    values.education,
    values.experience,
    values.cvName,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export default function SeekerProfilePage() {
  const hydrated = useHydrated();
  const session = useSession();
  const profile = useProfile(session?.userId);
  const { message } = AntApp.useApp();
  const [form] = Form.useForm<ProfileFormValues>();
  const [cvName, setCvName] = useState<string | null>(profile?.cvName ?? null);
  const [profilePicture, setProfilePicture] = useState<string | null>(
    profile?.profilePicture ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const [pictureUploadKey, setPictureUploadKey] = useState(0);

  if (!hydrated || !session) {
    return (
      <PageContainer maxWidth={980}>
        <PageSkeleton rows={10} />
      </PageContainer>
    );
  }

  const uploadProps: UploadProps = {
    name: 'cv',
    maxCount: 1,
    accept: '.pdf,application/pdf',
    beforeUpload: async (file) => {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        message.error('Upload a PDF file only.');
        return Upload.LIST_IGNORE;
      }
      if (file.size > MAX_CV_BYTES) {
        message.error('Your CV must be 5 MB or smaller.');
        return Upload.LIST_IGNORE;
      }
      if ((await file.slice(0, 5).text()) !== '%PDF-') {
        message.error('This file is not a valid PDF.');
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    onChange: ({ fileList }) => {
      setCvName(fileList[0]?.name ?? null);
    },
  };

  const profilePictureUploadProps: UploadProps = {
    name: 'profile-picture',
    accept: '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp',
    showUploadList: false,
    beforeUpload: (file) => {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!PROFILE_PICTURE_TYPES[extension] || file.type !== PROFILE_PICTURE_TYPES[extension]) {
        message.error('Choose a JPG, PNG, or WebP image.');
        return Upload.LIST_IGNORE;
      }
      if (file.size > MAX_PROFILE_PICTURE_BYTES) {
        message.error('Your profile picture must be 1 MB or smaller.');
        return Upload.LIST_IGNORE;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setProfilePicture(reader.result);
        }
        setPictureUploadKey((key) => key + 1);
      };
      reader.onerror = () => message.error('Could not read the selected image.');
      reader.readAsDataURL(file);
      return false;
    },
  };

  const handleFinish = async (values: ProfileFormValues) => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      saveProfile({
        userId: session.userId,
        email: session.email,
        fullName: values.fullName,
        headline: values.headline ?? '',
        phone: values.phone ?? '',
        location: values.location ?? '',
        skills: values.skills ?? [],
        education: values.education ?? '',
        experience: values.experience ?? '',
        cvName: cvName ?? undefined,
        profilePicture: profilePicture ?? undefined,
      });

      message.success('Profile saved.');
    } catch {
      message.error('Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const percent = completeness({
    headline: profile?.headline,
    phone: profile?.phone,
    location: profile?.location,
    skills: profile?.skills,
    education: profile?.education,
    experience: profile?.experience,
    cvName,
  });

  return (
    <PageContainer maxWidth={980}>
      <Suspense fallback={null}>
        <DeniedAlert />
      </Suspense>

      <Space
        style={{ justifyContent: 'space-between', width: '100%', marginBottom: 16 }}
        wrap
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            My profile
          </Title>
          <Text type="secondary">
            Employers see this information alongside your applications.
          </Text>
        </div>
        <Card size="small" style={{ minWidth: 220 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Profile strength
          </Text>
          <Progress percent={percent} status={percent === 100 ? 'success' : 'active'} />
        </Card>
      </Space>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              requiredMark="optional"
              initialValues={{
                fullName: profile?.fullName ?? session.name,
                headline: profile?.headline ?? '',
                phone: profile?.phone ?? '',
                location: profile?.location ?? '',
                skills: profile?.skills ?? [],
                education: profile?.education ?? '',
                experience: profile?.experience ?? '',
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="fullName"
                    label="Full name"
                    rules={[
                      { required: true, whitespace: true, message: 'Enter your full name' },
                    ]}
                  >
                    <Input prefix={<IdCard size={14} aria-hidden />} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Email address">
                    <Input
                      value={session.email}
                      readOnly
                      size="large"
                      prefix={<Mail size={14} aria-hidden />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="headline"
                label="Professional headline"
                extra="One line that describes what you do, e.g. Full-stack developer · React & Node.js"
              >
                <Input size="large" maxLength={90} showCount />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label="Phone number"
                    rules={[
                      {
                        pattern: /^[+0-9 ()-]{7,20}$/,
                        message: 'Enter a valid phone number',
                      },
                    ]}
                  >
                    <Input prefix={<Phone size={14} aria-hidden />} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="location" label="Location">
                    <Input prefix={<MapPin size={14} aria-hidden />} size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="skills"
                label="Skills"
                extra="Press Enter after each skill."
              >
                <Select
                  mode="tags"
                  size="large"
                  placeholder="e.g. React, SQL, Communication"
                  tokenSeparators={[',']}
                  aria-label="Skills"
                />
              </Form.Item>

              <Form.Item name="education" label="Education">
                <Input.TextArea
                  rows={3}
                  maxLength={400}
                  showCount
                  placeholder="Institution, qualification, year"
                />
              </Form.Item>

              <Form.Item name="experience" label="Work experience">
                <Input.TextArea
                  rows={5}
                  maxLength={1200}
                  showCount
                  placeholder="Roles, responsibilities and achievements"
                />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit" size="large" loading={saving}>
                  Save profile
                </Button>
                <Button
                  size="large"
                  onClick={() =>
                    form.setFieldsValue({
                      headline: '',
                      phone: '',
                      location: '',
                      skills: [],
                      education: '',
                      experience: '',
                    })
                  }
                >
                  Clear fields
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Profile picture" style={{ marginBottom: 16 }}>
            <Space direction="vertical" align="center" size={12} style={{ width: '100%' }}>
              <Avatar
                size={96}
                src={profilePicture ?? undefined}
                icon={!profilePicture ? <UserRound size={36} aria-hidden /> : undefined}
              />
              <Upload key={pictureUploadKey} {...profilePictureUploadProps}>
                <Button icon={<UploadCloud size={16} aria-hidden />}>Upload picture</Button>
              </Upload>
              {profilePicture ? (
                <Button type="link" danger onClick={() => setProfilePicture(null)}>
                  Remove picture
                </Button>
              ) : null}
              <Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
                JPG, PNG, or WebP. Maximum size: 1 MB.
              </Text>
            </Space>
          </Card>

          <Card title="CV">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {cvName ? (
                <Alert type="success" showIcon message="CV attached" description={cvName} />
              ) : (
                <Alert
                  type="info"
                  showIcon
                  message="No CV yet"
                  description="A CV is required when you apply for a vacancy."
                />
              )}

              <Upload.Dragger
                key={uploadKey}
                {...uploadProps}
                style={{ padding: 8 }}
              >
                <p style={{ margin: 0 }}>
                  <UploadCloud size={26} aria-hidden color="#2563eb" />
                </p>
                <p className="ant-upload-text" style={{ fontSize: 14 }}>
                  Upload or replace your CV
                </p>
                <p className="ant-upload-hint" style={{ fontSize: 12 }}>
                  PDF only, up to 5 MB
                </p>
              </Upload.Dragger>

              {cvName ? (
                <Button
                  block
                  onClick={() => {
                    setCvName(null);
                    setUploadKey((key) => key + 1);
                  }}
                >
                  Remove CV
                </Button>
              ) : null}

              <Text type="secondary" style={{ fontSize: 12 }}>
                Remember to save the profile after changing your CV.
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}
