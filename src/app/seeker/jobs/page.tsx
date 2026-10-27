'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, Empty, Input, List, Tag, Typography } from 'antd';
import { BriefcaseBusiness, MapPin } from 'lucide-react';

const { Title, Text } = Typography;

const jobs = [
  {
    id: 'job-101',
    title: 'Senior Full Stack Developer',
    company: 'TechCorp Solutions',
    location: 'Blantyre, Malawi',
    type: 'Full-time',
    salary: 'MWK 2.5m - 3.5m',
    summary: 'Lead product engineering across a modern recruitment platform.',
  },
  {
    id: 'job-102',
    title: 'Frontend Engineer',
    company: 'Mighty Media',
    location: 'Lilongwe, Malawi',
    type: 'Hybrid',
    salary: 'MWK 2.0m - 2.8m',
    summary: 'Build intuitive product experiences for a digital-first media business.',
  },
  {
    id: 'job-103',
    title: 'Product Analyst',
    company: 'Malaika Labs',
    location: 'Remote',
    type: 'Contract',
    salary: 'MWK 1.8m - 2.4m',
    summary: 'Translate customer insights into product decisions and experimentation.',
  },
  {
    id: 'job-104',
    title: 'UX Researcher',
    company: 'Nanjira',
    location: 'Blantyre, Malawi',
    type: 'Part-time',
    salary: 'MWK 1.4m - 2.0m',
    summary: 'Find patterns in user behavior and shape product direction.',
  },
  {
    id: 'job-105',
    title: 'Data Engineer',
    company: 'Apex Analytics',
    location: 'Remote',
    type: 'Full-time',
    salary: 'MWK 2.3m - 3.1m',
    summary: 'Design robust pipelines and analytics infrastructure for growth teams.',
  },
];

function JobsContent() {
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '');

  const filteredJobs = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    if (!normalized) {
      return jobs;
    }

    return jobs.filter((job) => {
      return [job.title, job.company, job.location, job.summary, job.type]
        .join(' ')
        .toLowerCase()
        .includes(normalized);
    });
  }, [keyword]);

  return (
    <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 16px 40px' }}>
      <Card style={{ borderRadius: 16, marginBottom: 20 }}>
        <Title level={2} style={{ marginBottom: 12 }}>Find jobs</Title>
        <Input.Search
          size="large"
          placeholder="Search by title, company, skill, or location"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          enterButton="Search"
        />
      </Card>

      {filteredJobs.length ? (
        <List
          itemLayout="vertical"
          dataSource={filteredJobs}
          renderItem={(job) => (
            <List.Item key={job.id} style={{ padding: 20, borderRadius: 16, marginBottom: 16, background: '#fff', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)' }}>
              <List.Item.Meta
                avatar={<BriefcaseBusiness size={20} color="#1677ff" />}
                title={
                  <Link href={`/seeker/jobs/${job.id}`} style={{ fontSize: 20, fontWeight: 600 }}>
                    {job.title}
                  </Link>
                }
                description={
                  <>
                    <Text strong>{job.company}</Text>
                    <br />
                    <Text type="secondary">{job.summary}</Text>
                  </>
                }
              />

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                <Tag icon={<MapPin size={12} />} color="blue">
                  {job.location}
                </Tag>
                <Tag color="green">{job.type}</Tag>
                <Tag color="gold">{job.salary}</Tag>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Card style={{ borderRadius: 16 }}>
          <Empty description={`No jobs match "${keyword}"`} />
        </Card>
      )}
    </div>
  );
}

export default function SeekerJobsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Loading jobs...</div>}>
      <JobsContent />
    </Suspense>
  );
}
