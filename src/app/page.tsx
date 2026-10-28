'use client';

import Link from 'next/link';
import { Button, Col, Row, Space, Tag } from 'antd';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  FileCheck2,
  MapPin,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { seedState } from '@/mock/seed';
import { deadlineLabel, formatSalary } from '@/lib/format';
import styles from './home.module.css';

const activeJobs = seedState.jobs.filter((job) => job.status === 'Active');

const featuredJobs = [...activeJobs]
  .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
  .slice(0, 3);

const employerCount = new Set(
  seedState.accounts
    .filter((account) => account.role === 'EMPLOYER')
    .map((account) => account.companyName),
).size;

const seekerSteps = [
  {
    title: 'Create your profile once',
    body: 'Add your skills, education and CV. Every application reuses it, so you never retype the same details.',
  },
  {
    title: 'Search vacancies that fit',
    body: 'Filter by keyword, district, work mode and contract type, then open a role to see the full requirements.',
  },
  {
    title: 'Track every application',
    body: 'Follow each application from submitted to shortlisted, interviewed and hired — no more guessing.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroInner}>
          <span className={styles.badge}>
            <Sparkles size={16} aria-hidden />
            Find your next opportunity
          </span>

          <h1 id="hero-title" className={styles.title}>
            Your next job is <span className={styles.titleAccent}>one search away</span>
          </h1>

          <p className={styles.subtitle}>
            Search vacancies, apply with your CV, and track every application in one
            place. Employers post roles and manage applicants from the same platform.
          </p>

          <form
            className={styles.searchForm}
            action="/seeker/jobs"
            method="get"
            role="search"
            aria-label="Search jobs"
          >
            <label htmlFor="home-keyword" className="sr-only">
              Job title, keyword or company
            </label>
            <span className={styles.searchField}>
              <Search size={18} aria-hidden />
              <input
                id="home-keyword"
                type="text"
                name="keyword"
                placeholder="Job title, keyword or company"
                autoComplete="off"
              />
            </span>

            <label htmlFor="home-location" className="sr-only">
              Location
            </label>
            <span className={styles.searchField}>
              <MapPin size={18} aria-hidden />
              <input
                id="home-location"
                type="text"
                name="location"
                placeholder="City or district"
                autoComplete="address-level2"
              />
            </span>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className={styles.searchButton}
              icon={<Search size={16} aria-hidden />}
            >
              Search
            </Button>
          </form>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>{activeJobs.length}</div>
              <div className={styles.statLabel}>Live vacancies</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{employerCount}</div>
              <div className={styles.statLabel}>Hiring teams</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>1 place</div>
              <div className={styles.statLabel}>To track applications</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="featured-title">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="featured-title" className={styles.sectionTitle}>
              Latest vacancies
            </h2>
            <p className={styles.sectionLead}>
              Freshly posted roles from employers hiring right now.
            </p>
          </div>
          <Link href="/seeker/jobs">
            <Button icon={<ArrowRight size={16} aria-hidden />} iconPosition="end">
              Browse all jobs
            </Button>
          </Link>
        </div>

        <Row gutter={[16, 16]}>
          {featuredJobs.map((job) => (
            <Col xs={24} md={12} lg={8} key={job.id}>
              <article className={styles.jobCard}>
                <Space size={6} style={{ color: 'var(--app-muted)', fontSize: 13 }}>
                  <Building2 size={14} aria-hidden />
                  {job.company}
                </Space>
                <h3 style={{ margin: 0, fontSize: 18 }}>{job.title}</h3>
                <div className={styles.jobMeta}>
                  <Tag icon={<MapPin size={12} aria-hidden />} color="blue">
                    {job.location}
                  </Tag>
                  <Tag color="cyan">{job.workMode}</Tag>
                  <Tag color="geekblue">{job.type}</Tag>
                </div>
                <p style={{ margin: 0, color: 'var(--app-muted)' }}>{job.summary}</p>
                <Space
                  style={{ justifyContent: 'space-between', width: '100%', marginTop: 'auto' }}
                  wrap
                >
                  <strong style={{ fontSize: 14 }}>
                    {formatSalary(job.currency, job.salaryMin, job.salaryMax)}
                  </strong>
                  <Tag color="gold">{deadlineLabel(job.deadline)}</Tag>
                </Space>
                <Link href={`/seeker/jobs/${job.id}`} style={{ marginTop: 4 }}>
                  <Button type="link" style={{ paddingInline: 0 }}>
                    View job details
                  </Button>
                </Link>
              </article>
            </Col>
          ))}
        </Row>
      </section>

      <section className={styles.section} aria-labelledby="how-title">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="how-title" className={styles.sectionTitle}>
              How it works for job seekers
            </h2>
            <p className={styles.sectionLead}>
              Three steps from finding a vacancy to knowing where you stand.
            </p>
          </div>
        </div>

        <div className={styles.steps}>
          {seekerSteps.map((step, index) => (
            <div className={styles.step} key={step.title}>
              <span className={styles.stepNumber} aria-hidden>
                {index + 1}
              </span>
              <h3 style={{ margin: '0 0 8px', fontSize: 17 }}>{step.title}</h3>
              <p style={{ margin: 0, color: 'var(--app-muted)', lineHeight: 1.6 }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.employerBand} aria-labelledby="employer-title">
        <div className={styles.employerCard}>
          <div style={{ maxWidth: 560 }}>
            <Space size={8} style={{ opacity: 0.8 }}>
              <BriefcaseBusiness size={16} aria-hidden />
              For employers
            </Space>
            <h2
              id="employer-title"
              style={{ margin: '10px 0 8px', fontSize: 'clamp(22px, 3vw, 28px)' }}
            >
              Post a vacancy and review every applicant in one place
            </h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
              Publish a role in minutes, then shortlist, interview and hire with a clear
              view of who applied and where they are in the process.
            </p>
          </div>
          <Space wrap size={12}>
            <Link href="/register?role=EMPLOYER">
              <Button size="large" type="primary">
                <Users size={16} aria-hidden /> Create an employer account
              </Button>
            </Link>
            <Link href="/login?role=EMPLOYER">
              <Button size="large" ghost>
                <FileCheck2 size={16} aria-hidden /> Employer sign in
              </Button>
            </Link>
          </Space>
        </div>
      </section>

      <div style={{ height: 56 }} />
    </>
  );
}
