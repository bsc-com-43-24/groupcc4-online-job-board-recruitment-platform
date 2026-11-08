'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Button,
  Tag,
} from 'antd';
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FilePlus2,
  Inbox,
  Users,
  UserRoundCheck,
} from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { clearAuthSession, getAuthSession } from '@/services/authService';
import {
  EmployerApplication,
  EmployerVacancy,
  loadEmployerWorkspace,
  EmployerWorkspaceData,
} from '@/services/employerWorkspaceService';
import styles from './employer-home.module.css';

const EMPTY_WORKSPACE: EmployerWorkspaceData = {
  vacancies: [],
  applications: [],
  notifications: [],
};

function normalizedStatus(status: string) {
  return status.trim().toLowerCase();
}

function isActiveVacancy(vacancy: EmployerVacancy) {
  return ['active', 'open', 'published'].includes(normalizedStatus(vacancy.status));
}

function isClosedVacancy(vacancy: EmployerVacancy) {
  return ['closed', 'filled', 'expired'].includes(normalizedStatus(vacancy.status));
}

function isAwaitingReview(application: EmployerApplication) {
  return ['pending', 'new', 'awaiting review'].includes(normalizedStatus(application.status));
}

function daysUntil(deadline: string) {
  const closingDate = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(closingDate.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((closingDate.getTime() - today.getTime()) / 86_400_000);
}

function formatDate(value: string) {
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? 'Date not set'
    : new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function latestFirst<T extends { appliedDate?: string; createdAt?: string }>(items: T[], dateKey: 'appliedDate' | 'createdAt') {
  return [...items].sort((a, b) => {
    const first = a[dateKey] ?? '';
    const second = b[dateKey] ?? '';
    return second.localeCompare(first);
  });
}

export default function EmployerHomePage() {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<EmployerWorkspaceData>(EMPTY_WORKSPACE);
  const [employerName, setEmployerName] = useState('Employer');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const session = getAuthSession();
    if (!session || session.role !== 'EMPLOYER') {
      setError('This page is available to signed-in employers only.');
      setLoading(false);
      return;
    }

    if (!session.userId) {
      clearAuthSession();
      router.replace('/login');
      return;
    }

    try {
      setEmployerName(session.userName);
      setWorkspace(loadEmployerWorkspace(session.userId));
    } catch {
      setError('We could not load your recruitment activity. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [reloadKey, router]);

  const ownedVacancyIds = new Set(workspace.vacancies.map((vacancy) => vacancy.id));
  const employerApplications = workspace.applications.filter((application) => ownedVacancyIds.has(application.jobId));
  const applications = latestFirst(employerApplications, 'appliedDate');
  const vacancies = latestFirst(workspace.vacancies, 'createdAt');
  const notifications = latestFirst(workspace.notifications, 'createdAt');
  const activeCount = workspace.vacancies.filter(isActiveVacancy).length;
  const closedCount = workspace.vacancies.filter(isClosedVacancy).length;
  const pendingCount = employerApplications.filter(isAwaitingReview).length;
  const shortlistedCount = employerApplications.filter(
    (application) => normalizedStatus(application.status) === 'shortlisted',
  ).length;
  const hiredCount = employerApplications.filter(
    (application) => normalizedStatus(application.status) === 'hired',
  ).length;
  const closingSoon = workspace.vacancies.filter((vacancy) => {
    if (!isActiveVacancy(vacancy) || !vacancy.deadline) {
      return false;
    }

    const remaining = daysUntil(vacancy.deadline);
    return remaining !== null && remaining >= 0 && remaining <= 7;
  });

  const metrics = [
    { label: 'Active vacancies', value: activeCount, icon: BriefcaseBusiness, href: '/employer/jobs', tone: 'green' },
    { label: 'Closed vacancies', value: closedCount, icon: CheckCircle2, href: '/employer/jobs', tone: 'gray' },
    { label: 'Total applicants', value: employerApplications.length, icon: Users, href: '/employer/applications', tone: 'blue' },
    { label: 'Awaiting review', value: pendingCount, icon: Inbox, href: '/employer/applications', tone: 'amber' },
    { label: 'Shortlisted', value: shortlistedCount, icon: UserRoundCheck, href: '/employer/applications', tone: 'teal' },
    { label: 'Hired', value: hiredCount, icon: CheckCircle2, href: '/employer/applications', tone: 'navy' },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.pageInner}>
        <section className={styles.welcome}>
          <div className={styles.welcomeText}>
            <p className={styles.eyebrow}>EMPLOYER WORKSPACE</p>
            <h1>Welcome, {employerName}</h1>
            <p>Here is what is happening across your recruitment today.</p>
          </div>
          <Link className={styles.primaryAction} href="/employer/jobs/new">
            <FilePlus2 size={18} aria-hidden="true" />
            Post a new job
          </Link>
        </section>

        {error && (
          <Alert
            className={styles.errorAlert}
            type="error"
            showIcon
            message="Dashboard unavailable"
            description={error}
            action={
              <Button size="small" onClick={() => setReloadKey((key) => key + 1)}>
                Retry
              </Button>
            }
          />
        )}

        {loading ? (
          <section className={styles.metricGrid} aria-label="Loading recruitment metrics">
            {metrics.map((metric) => (
              <div className={styles.metricSkeleton} key={metric.label}>
                <SkeletonLoader rows={1} />
              </div>
            ))}
          </section>
        ) : !error ? (
          <section className={styles.metricGrid} aria-label="Recruitment metrics">
            {metrics.map(({ label, value, icon: Icon, href, tone }) => (
              <Link className={styles.metricCard} href={href} key={label}>
                <div className={`${styles.metricIcon} ${styles[tone]}`}>
                  <Icon size={20} aria-hidden="true" />
                </div>
                <span className={styles.metricLabel}>{label}</span>
                <strong className={styles.metricValue}>{value}</strong>
                <ArrowRight className={styles.metricArrow} size={16} aria-hidden="true" />
              </Link>
            ))}
          </section>
        ) : null}

        {!error && (
          <>
        <section className={styles.closingSoon}>
          <div className={styles.sectionHeading}>
            <div className={styles.headingIcon}><CalendarClock size={19} /></div>
            <div>
              <h2>Closing soon</h2>
              <p>Active vacancies with deadlines in the next 7 days</p>
            </div>
          </div>
          {loading ? <SkeletonLoader rows={1} title={false} /> : closingSoon.length ? (
            <div className={styles.closingList}>
              {closingSoon.map((vacancy) => (
                <Link className={styles.closingItem} href="/employer/jobs" key={vacancy.id}>
                  <span>{vacancy.title}</span>
                  <Tag color="orange">Closes {formatDate(vacancy.deadline || '')}</Tag>
                </Link>
              ))}
            </div>
          ) : (
            <p className={styles.quietEmpty}>No active vacancies are closing in the next 7 days.</p>
          )}
        </section>

        <div className={styles.contentGrid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.eyebrow}>CANDIDATE PIPELINE</p>
                <h2>Recent applications</h2>
              </div>
              <Link className={styles.textLink} href="/employer/applications">
                View all <ArrowRight size={16} />
              </Link>
            </div>
            {loading ? <SkeletonLoader rows={4} title={false} /> : applications.length ? (
              <div className={styles.applicationList}>
                {applications.slice(0, 5).map((application) => (
                  <Link className={styles.applicationRow} href="/employer/applications" key={application.id}>
                    <span className={styles.avatar}>{application.candidateName.trim().charAt(0).toUpperCase() || '?'}</span>
                    <span className={styles.applicationInfo}>
                      <strong>{application.candidateName}</strong>
                      <span>{application.jobTitle}</span>
                    </span>
                    <span className={styles.applicationMeta}>
                      <Tag color={normalizedStatus(application.status) === 'pending' ? 'gold' : 'blue'}>{application.status}</Tag>
                      <small>{formatDate(application.appliedDate)}</small>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title="No applications have arrived yet" description="New candidate applications will appear here." />
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.eyebrow}>YOUR OPENINGS</p>
                <h2>My vacancies</h2>
              </div>
              <Link className={styles.textLink} href="/employer/jobs">
                View all <ArrowRight size={16} />
              </Link>
            </div>
            {loading ? <SkeletonLoader rows={4} title={false} /> : vacancies.length ? (
              <div className={styles.vacancyList}>
                {vacancies.slice(0, 5).map((vacancy) => {
                  const applicantCount = employerApplications.filter((application) => application.jobId === vacancy.id).length;
                  const daysLeft = vacancy.deadline ? daysUntil(vacancy.deadline) : null;

                  return (
                    <Link className={styles.vacancyRow} href="/employer/jobs" key={vacancy.id}>
                      <span className={styles.vacancyMain}>
                        <strong>{vacancy.title}</strong>
                        <small>{applicantCount} applicants · Deadline {formatDate(vacancy.deadline || '')}</small>
                      </span>
                      <span className={styles.vacancyStatus}>
                        <Tag color={isActiveVacancy(vacancy) ? 'green' : 'default'}>{vacancy.status}</Tag>
                        {daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && <Clock3 size={16} color="#b45309" />}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyVacancies}>
                <EmptyState title="You haven't posted any vacancies yet" description="Post your first vacancy to start hiring." />
                <Link className={styles.secondaryAction} href="/employer/jobs/new">Post your first job</Link>
              </div>
            )}
          </section>

          <section className={`${styles.panel} ${styles.notificationsPanel}`}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.eyebrow}>ACTIVITY</p>
                <h2>Latest notifications</h2>
              </div>
              <Bell size={19} className={styles.notificationIcon} aria-hidden="true" />
            </div>
            {loading ? <SkeletonLoader rows={3} title={false} /> : notifications.length ? (
              <div className={styles.notificationList}>
                {notifications.slice(0, 3).map((notification) => (
                  <div className={styles.notificationRow} key={notification.id}>
                    <span className={styles.notificationDot} />
                    <div>
                      <strong>{notification.title}</strong>
                      <p>{notification.detail}</p>
                      <small>{formatDate(notification.createdAt)}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="You're all caught up" description="New activity will appear here." />
            )}
          </section>
        </div>
          </>
        )}
      </div>
    </main>
  );
}