'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Pagination,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import { Building2, MapPin, SlidersHorizontal } from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import { usePublishedJobs } from '@/hooks/useStore';
import { deadlineLabel, daysUntil, formatSalary } from '@/lib/format';
import type { JobType, WorkMode } from '@/mock/types';

const { Title, Text } = Typography;

const PAGE_SIZE = 6;

const JOB_TYPES: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const WORK_MODES: WorkMode[] = ['On-site', 'Hybrid', 'Remote'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'deadline', label: 'Closing soonest' },
  { value: 'salary', label: 'Highest salary' },
];

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobs = usePublishedJobs();

  const keyword = (searchParams.get('keyword') ?? '').trim();
  const location = searchParams.get('location') ?? '';
  const type = searchParams.get('type') ?? '';
  const workMode = searchParams.get('workMode') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';
  const requestedPage = Number(searchParams.get('page') ?? '1');
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const locationOptions = useMemo(
    () =>
      Array.from(new Set(jobs.map((job) => job.location)))
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({ value, label: value })),
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    const needle = keyword.toLowerCase();

    const result = jobs.filter((job) => {
      if (needle) {
        const haystack = [
          job.title,
          job.company,
          job.location,
          job.summary,
          job.type,
          job.workMode,
          job.skills.join(' '),
        ]
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(needle)) {
          return false;
        }
      }

      if (location && job.location !== location) {
        return false;
      }
      if (type && job.type !== type) {
        return false;
      }
      if (workMode && job.workMode !== workMode) {
        return false;
      }

      return true;
    });

    result.sort((a, b) => {
      if (sort === 'deadline') {
        return a.deadline.localeCompare(b.deadline);
      }
      if (sort === 'salary') {
        return b.salaryMax - a.salaryMax;
      }
      return b.postedAt.localeCompare(a.postedAt);
    });

    return result;
  }, [jobs, keyword, location, type, workMode, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleJobs = filteredJobs.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const activeFilters = [keyword, location, type, workMode].filter(Boolean).length;

  const applyParams = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());

    Object.entries(patch).forEach(([key, value]) => {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });

    const query = next.toString();
    router.push(query ? `/seeker/jobs?${query}` : '/seeker/jobs');
  };

  const clearFilters = () => router.push('/seeker/jobs');

  return (
    <PageContainer maxWidth={1200}>
      <Space direction="vertical" size={4} style={{ marginBottom: 20 }}>
        <Title level={2} style={{ margin: 0 }}>
          Browse jobs
        </Title>
        <Text type="secondary">
          {filteredJobs.length} {filteredJobs.length === 1 ? 'vacancy' : 'vacancies'}
          {keyword ? ` matching “${keyword}”` : ' open right now'}
        </Text>
      </Space>

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} lg={9}>
            <label htmlFor="job-search" className="sr-only">
              Search jobs by title, company, skill or location
            </label>
            <Input.Search
              id="job-search"
              key={keyword}
              size="large"
              allowClear
              defaultValue={keyword}
              placeholder="Search title, company, skill or location"
              enterButton="Search"
              onSearch={(value) => applyParams({ keyword: value.trim() || undefined })}
            />
          </Col>

          <Col xs={12} md={6} lg={4}>
            <Select
              aria-label="Filter by location"
              size="large"
              allowClear
              style={{ width: '100%' }}
              placeholder="Location"
              value={location || undefined}
              options={locationOptions}
              onChange={(value) => applyParams({ location: value })}
            />
          </Col>

          <Col xs={12} md={6} lg={3}>
            <Select
              aria-label="Filter by contract type"
              size="large"
              allowClear
              style={{ width: '100%' }}
              placeholder="Job type"
              value={type || undefined}
              options={JOB_TYPES.map((value) => ({ value, label: value }))}
              onChange={(value) => applyParams({ type: value })}
            />
          </Col>

          <Col xs={12} md={6} lg={4}>
            <Select
              aria-label="Filter by work mode"
              size="large"
              allowClear
              style={{ width: '100%' }}
              placeholder="Work mode"
              value={workMode || undefined}
              options={WORK_MODES.map((value) => ({ value, label: value }))}
              onChange={(value) => applyParams({ workMode: value })}
            />
          </Col>

          <Col xs={12} md={6} lg={4}>
            <Select
              aria-label="Sort results"
              size="large"
              style={{ width: '100%' }}
              value={sort}
              options={SORT_OPTIONS}
              onChange={(value) => applyParams({ sort: value })}
            />
          </Col>
        </Row>

        {activeFilters > 0 ? (
          <Space style={{ marginTop: 12 }} wrap>
            <Text type="secondary">
              <SlidersHorizontal size={14} aria-hidden /> {activeFilters} filter
              {activeFilters === 1 ? '' : 's'} applied
            </Text>
            <Button type="link" onClick={clearFilters} style={{ paddingInline: 0 }}>
              Clear all filters
            </Button>
          </Space>
        ) : null}
      </Card>

      {visibleJobs.length === 0 ? (
        <Card>
          <Empty
            description={
              <Space direction="vertical" size={4}>
                <Text strong>No vacancies match those filters</Text>
                <Text type="secondary">
                  Try a broader keyword, or clear the filters to see every open role.
                </Text>
              </Space>
            }
          >
            <Button type="primary" onClick={clearFilters}>
              Clear filters
            </Button>
          </Empty>
        </Card>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {visibleJobs.map((job) => (
              <Col xs={24} md={12} xl={8} key={job.id}>
                <Card
                  style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                  styles={{ body: { display: 'flex', flexDirection: 'column', gap: 10, height: '100%' } }}
                >
                  <Space size={6} style={{ color: 'var(--app-muted)', fontSize: 13 }}>
                    <Building2 size={14} aria-hidden />
                    {job.company}
                  </Space>

                  <Title level={4} style={{ margin: 0 }}>
                    <Link href={`/seeker/jobs/${job.id}`}>{job.title}</Link>
                  </Title>

                  <Space size={[6, 6]} wrap>
                    <Tag icon={<MapPin size={12} aria-hidden />} color="blue">
                      {job.location}
                    </Tag>
                    <Tag color="cyan">{job.workMode}</Tag>
                    <Tag color="geekblue">{job.type}</Tag>
                  </Space>

                  <Text type="secondary" style={{ lineHeight: 1.6 }}>
                    {job.summary}
                  </Text>

                  <Space
                    style={{ marginTop: 'auto', justifyContent: 'space-between', width: '100%' }}
                    wrap
                  >
                    <Text strong>
                      {formatSalary(job.currency, job.salaryMin, job.salaryMax)}
                    </Text>
                    <Tag color={daysUntil(job.deadline) <= 7 ? 'orange' : 'gold'}>
                      {deadlineLabel(job.deadline)}
                    </Tag>
                  </Space>

                  <Link href={`/seeker/jobs/${job.id}`}>
                    <Button block type="primary" ghost>
                      View details
                    </Button>
                  </Link>
                </Card>
              </Col>
            ))}
          </Row>

          {filteredJobs.length > PAGE_SIZE ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
              <Pagination
                current={safePage}
                pageSize={PAGE_SIZE}
                total={filteredJobs.length}
                showSizeChanger={false}
                onChange={(nextPage) => applyParams({ page: String(nextPage) })}
              />
            </div>
          ) : null}
        </>
      )}
    </PageContainer>
  );
}

export default function SeekerJobsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer maxWidth={1200}>
          <Card loading />
        </PageContainer>
      }
    >
      <JobsContent />
    </Suspense>
  );
}
