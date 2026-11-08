'use client';

import { Suspense, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Button,
  Card,
  Col,
  Input,
  InputNumber,
  Pagination,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { Building2, MapPin, SlidersHorizontal } from 'lucide-react';
import PageContainer from '@/components/PageContainer';
import EmptyState from '@/components/ui/EmptyState';
import { usePublishedJobs } from '@/hooks/useStore';
import { deadlineLabel, daysUntil, formatSalary } from '@/lib/format';
import type { Job, JobCategory, JobType, WorkMode } from '@/mock/types';

const { Title, Text } = Typography;

const PAGE_SIZE = 6;

const JOB_TYPES: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const WORK_MODES: WorkMode[] = ['On-site', 'Hybrid', 'Remote'];
const JOB_CATEGORIES: JobCategory[] = [
  'Technology',
  'Marketing',
  'Business & Finance',
  'Sales',
  'Design & Research',
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'relevance', label: 'Relevance' },
];

function queryNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function relevanceScore(job: Job, terms: string[]): number {
  const fields: Array<[string, number]> = [
    [job.title, 5],
    [job.skills.join(' '), 4],
    [job.company, 3],
    [job.category ?? '', 3],
    [job.location, 3],
    [`${job.type} ${job.workMode}`, 2],
    [job.summary, 2],
    [job.description, 1],
  ];

  return terms.reduce(
    (score, term) =>
      score +
      fields.reduce(
        (fieldScore, [value, weight]) =>
          fieldScore + (value.toLowerCase().includes(term) ? weight : 0),
        0,
      ),
    0,
  );
}

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const jobs = usePublishedJobs();

  const keyword = (searchParams.get('keyword') ?? '').trim();
  const location = searchParams.get('location') ?? '';
  const type = searchParams.get('type') ?? '';
  const category = searchParams.get('category') ?? '';
  const workMode = searchParams.get('workMode') ?? '';
  const salaryMin = queryNumber(searchParams.get('salaryMin'));
  const salaryMax = queryNumber(searchParams.get('salaryMax'));
  const sort = searchParams.get('sort') === 'relevance' ? 'relevance' : 'newest';
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
    const terms = keyword.toLowerCase().split(/\s+/).filter(Boolean);

    const result = jobs.filter((job) => {
      if (terms.length) {
        const haystack = [
          job.title,
          job.company,
          job.location,
          job.category ?? '',
          job.summary,
          job.type,
          job.workMode,
          job.skills.join(' '),
        ]
          .join(' ')
          .toLowerCase();

        if (!terms.every((term) => haystack.includes(term))) {
          return false;
        }
      }

      if (location && !job.location.toLowerCase().includes(location.toLowerCase())) {
        return false;
      }
      if (type && job.type !== type) {
        return false;
      }
      if (category && job.category !== category) {
        return false;
      }
      if (workMode && job.workMode !== workMode) {
        return false;
      }
      if (salaryMin !== undefined && job.salaryMax < salaryMin) {
        return false;
      }
      if (salaryMax !== undefined && job.salaryMin > salaryMax) {
        return false;
      }
      if (salaryMin !== undefined && salaryMax !== undefined && salaryMin > salaryMax) {
        return false;
      }

      return true;
    });

    result.sort((a, b) => {
      if (sort === 'relevance' && terms.length) {
        const scoreDifference = relevanceScore(b, terms) - relevanceScore(a, terms);
        if (scoreDifference) {
          return scoreDifference;
        }
      }
      return b.postedAt.localeCompare(a.postedAt);
    });

    return result;
  }, [jobs, keyword, location, type, category, workMode, salaryMin, salaryMax, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleJobs = filteredJobs.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const activeFilters = [
    keyword,
    location,
    type,
    category,
    workMode,
    salaryMin !== undefined ? 'salaryMin' : '',
    salaryMax !== undefined ? 'salaryMax' : '',
  ].filter(Boolean).length;
  const hasSearchState = activeFilters > 0 || searchParams.toString().length > 0;

  const applyParams = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());

    if (!Object.hasOwn(patch, 'page')) {
      next.delete('page');
    }

    Object.entries(patch).forEach(([key, value]) => {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });

    const query = next.toString();
    startTransition(() => {
      router.push(query ? `/seeker/jobs?${query}` : '/seeker/jobs');
    });
  };

  const clearFilters = () => {
    startTransition(() => router.push('/seeker/jobs'));
  };

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

          <Col xs={12} md={6} lg={3}>
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

          <Col xs={12} md={6} lg={3}>
            <Select
              aria-label="Filter by category"
              size="large"
              allowClear
              style={{ width: '100%' }}
              placeholder="Category"
              value={category || undefined}
              options={JOB_CATEGORIES.map((value) => ({ value, label: value }))}
              onChange={(value) => applyParams({ category: value })}
            />
          </Col>

          <Col xs={12} md={6} lg={3}>
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

          <Col xs={12} md={6} lg={3}>
            <Select
              aria-label="Sort results"
              size="large"
              style={{ width: '100%' }}
              value={sort}
              options={SORT_OPTIONS}
              onChange={(value) => applyParams({ sort: value })}
            />
          </Col>

          <Col xs={12} md={6} lg={3}>
            <InputNumber
              aria-label="Minimum salary per month"
              size="large"
              min={0}
              step={50000}
              style={{ width: '100%' }}
              placeholder="Min salary (MWK)"
              value={salaryMin}
              onChange={(value) =>
                applyParams({ salaryMin: value == null ? undefined : String(value) })
              }
            />
          </Col>
          <Col xs={12} md={6} lg={3}>
            <InputNumber
              aria-label="Maximum salary per month"
              size="large"
              min={0}
              step={50000}
              style={{ width: '100%' }}
              placeholder="Max salary (MWK)"
              value={salaryMax}
              onChange={(value) =>
                applyParams({ salaryMax: value == null ? undefined : String(value) })
              }
            />
          </Col>
        </Row>

        {salaryMin !== undefined &&
        salaryMax !== undefined &&
        salaryMin > salaryMax ? (
          <Alert
            type="error"
            showIcon
            message="Minimum salary must be less than or equal to maximum salary."
            style={{ marginTop: 12 }}
          />
        ) : null}

        {hasSearchState ? (
          <Space style={{ marginTop: 12 }} wrap>
            {activeFilters > 0 ? (
              <Text type="secondary">
                <SlidersHorizontal size={14} aria-hidden /> {activeFilters} filter
                {activeFilters === 1 ? '' : 's'} applied
              </Text>
            ) : null}
            <Button type="link" onClick={clearFilters} style={{ paddingInline: 0 }}>
              Clear filters
            </Button>
          </Space>
        ) : null}
      </Card>

      <Spin spinning={isPending} tip="Updating results…">
      {visibleJobs.length === 0 ? (
        <Card>
          <EmptyState
            title="No vacancies match those filters"
            description="Try a broader keyword, or clear the filters to see every open role."
            action={
            <Button type="primary" onClick={clearFilters}>
              Clear filters
            </Button>
            }
          />
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
                    {job.category ? <Tag color="purple">{job.category}</Tag> : null}
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
      </Spin>
    </PageContainer>
  );
}

export default function SeekerJobsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer maxWidth={1200}>
          <PageSkeleton rows={5} />
        </PageContainer>
      }
    >
      <JobsContent />
    </Suspense>
  );
}
