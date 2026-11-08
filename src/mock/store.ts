import { createExternalStore } from '@/lib/createExternalStore';
import { seedState } from './seed';
import type {
  Account,
  Application,
  ApplicationStatus,
  Job,
  MockState,
  NotificationItem,
  SeekerProfile,
} from './types';

const STORAGE_KEY = 'cc4.jobboard.v1';

/**
 * Reads the persisted demo state. Anything unexpected (missing key, corrupt
 * JSON, an older shape) falls back to the seed so the app never renders empty.
 */
function readPersistedState(): MockState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<MockState>;
    if (
      !parsed ||
      !Array.isArray(parsed.jobs) ||
      !Array.isArray(parsed.applications) ||
      !Array.isArray(parsed.accounts) ||
      !Array.isArray(parsed.profiles) ||
      !Array.isArray(parsed.notifications)
    ) {
      return null;
    }

    return {
      jobs: parsed.jobs,
      applications: parsed.applications,
      accounts: parsed.accounts,
      profiles: parsed.profiles,
      notifications: parsed.notifications,
    };
  } catch {
    return null;
  }
}

const initialState = readPersistedState() ?? seedState;

export const mockStore = createExternalStore<MockState>(initialState);

if (typeof window !== 'undefined') {
  // Persist every change so a page refresh keeps applications and edits.
  mockStore.subscribe(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mockStore.get()));
    } catch {
      // A full or blocked storage quota must not break the demo.
    }
  });
}

/** Restores the demo data, used by the "reset demo data" action. */
export function resetMockStore(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures; the in-memory reset still applies.
  }
  mockStore.set(seedState);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function createNotification(
  input: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>,
): NotificationItem {
  return {
    ...input,
    id: `ntf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
}

/* ------------------------------------------------------------------ */
/* Accounts                                                            */
/* ------------------------------------------------------------------ */

export function findAccount(email: string, password: string): Account | undefined {
  const normalized = email.trim().toLowerCase();
  return mockStore
    .get()
    .accounts.find(
      (account) =>
        account.email.toLowerCase() === normalized && account.password === password,
    );
}

export function findAccountByEmail(email: string): Account | undefined {
  const normalized = email.trim().toLowerCase();
  return mockStore
    .get()
    .accounts.find((account) => account.email.toLowerCase() === normalized);
}

export function createAccount(input: {
  email: string;
  password: string;
  role: Account['role'];
  name: string;
  companyName?: string;
}): Account {
  const account: Account = {
    id: `usr-${Date.now().toString(36)}`,
    email: input.email.trim(),
    password: input.password,
    role: input.role,
    name: input.name,
    companyName: input.companyName,
  };
  mockStore.set((state) => ({ ...state, accounts: [...state.accounts, account] }));

  if (account.role === 'SEEKER') {
    saveProfile({
      userId: account.id,
      fullName: account.name,
      email: account.email,
      headline: '',
      phone: '',
      location: '',
      skills: [],
      education: '',
      experience: '',
    });
  }

  return account;
}

export function updateAccountPassword(accountId: string, password: string): boolean {
  let updated = false;
  mockStore.set((state) => ({
    ...state,
    accounts: state.accounts.map((account) => {
      if (account.id !== accountId) {
        return account;
      }
      updated = true;
      return { ...account, password };
    }),
  }));
  return updated;
}

/* ------------------------------------------------------------------ */
/* Jobs                                                                */
/* ------------------------------------------------------------------ */

export function getJobById(id: string | undefined): Job | undefined {
  if (!id) {
    return undefined;
  }
  return mockStore.get().jobs.find((job) => job.id === id);
}

export function createJob(
  input: Omit<Job, 'id' | 'postedAt'> & { postedAt?: string },
): Job {
  const job: Job = {
    ...input,
    id: `job-${Date.now().toString(36)}`,
    postedAt: input.postedAt ?? todayISO(),
  };

  mockStore.set((state) => ({ ...state, jobs: [job, ...state.jobs] }));
  return job;
}

export function updateJob(id: string, patch: Partial<Job>): void {
  mockStore.set((state) => ({
    ...state,
    jobs: state.jobs.map((job) => (job.id === id ? { ...job, ...patch } : job)),
  }));
}

/* ------------------------------------------------------------------ */
/* Applications                                                        */
/* ------------------------------------------------------------------ */

export function hasApplied(jobId: string, seekerId: string | undefined): boolean {
  if (!seekerId) {
    return false;
  }
  return mockStore
    .get()
    .applications.some(
      (application) =>
        application.jobId === jobId && application.seekerId === seekerId,
    );
}

export function findApplication(
  jobId: string,
  seekerId: string | undefined,
): Application | undefined {
  if (!seekerId) {
    return undefined;
  }
  return mockStore
    .get()
    .applications.find(
      (application) =>
        application.jobId === jobId && application.seekerId === seekerId,
    );
}

/** Creates an application, ignoring duplicates from the same seeker. */
export function applyToJob(input: {
  job: Job;
  seekerId: string;
  seekerName: string;
  seekerEmail: string;
  coverLetter?: string;
  cvName?: string;
}): Application | null {
  if (hasApplied(input.job.id, input.seekerId)) {
    return null;
  }

  const application: Application = {
    id: `APP-${Date.now().toString(36)}`,
    jobId: input.job.id,
    seekerId: input.seekerId,
    seekerName: input.seekerName,
    seekerEmail: input.seekerEmail,
    appliedAt: todayISO(),
    status: 'Submitted',
    coverLetter: input.coverLetter,
    cvName: input.cvName,
  };
  const notification = createNotification({
    userId: input.job.employerId,
    title: 'New application received',
    detail: `${input.seekerName} applied for ${input.job.title}.`,
    kind: 'NEW_APPLICATION',
    href: `/employer/jobs/${input.job.id}`,
    applicationId: application.id,
    jobId: input.job.id,
  });

  mockStore.set((state) => ({
    ...state,
    applications: [application, ...state.applications],
    notifications: [notification, ...state.notifications],
  }));

  return application;
}

export function setApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
): void {
  mockStore.set((state) => {
    const application = state.applications.find((item) => item.id === applicationId);
    if (!application || application.status === status) {
      return state;
    }

    const job = state.jobs.find((item) => item.id === application.jobId);
    const statusMessages: Partial<Record<ApplicationStatus, string>> = {
      Shortlisted: 'Your application was shortlisted',
      Hired: 'Congratulations, you were hired',
      Rejected: 'Your application was not selected',
    };
    const title = statusMessages[status];
    const notification = title
      ? createNotification({
          userId: application.seekerId,
          title,
          detail: `${job?.company ?? 'The employer'} updated your application for ${job?.title ?? 'a vacancy'} to ${status}.`,
          kind: 'APPLICATION_STATUS',
          href: `/seeker/applications#application-${application.id}`,
          applicationId: application.id,
          jobId: application.jobId,
        })
      : null;

    return {
      ...state,
      applications: state.applications.map((item) =>
        item.id === applicationId ? { ...item, status } : item,
      ),
      notifications: notification ? [notification, ...state.notifications] : state.notifications,
    };
  });
}

export function withdrawApplication(applicationId: string): boolean {
  let withdrawn = false;
  mockStore.set((state) => {
    const application = state.applications.find((item) => item.id === applicationId);
    if (
      !application ||
      ['Hired', 'Rejected', 'Withdrawn'].includes(application.status)
    ) {
      return state;
    }

    const job = state.jobs.find((item) => item.id === application.jobId);
    const notification = job
      ? createNotification({
          userId: job.employerId,
          title: 'Application withdrawn',
          detail: `${application.seekerName} withdrew their application for ${job.title}.`,
          kind: 'APPLICATION_WITHDRAWN',
          href: `/employer/jobs/${job.id}`,
          applicationId: application.id,
          jobId: job.id,
        })
      : null;
    withdrawn = true;

    return {
      ...state,
      applications: state.applications.map((item) =>
        item.id === applicationId ? { ...item, status: 'Withdrawn' } : item,
      ),
      notifications: notification ? [notification, ...state.notifications] : state.notifications,
    };
  });
  return withdrawn;
}

export function syncVacancyClosingNotifications(employerId: string): void {
  const state = mockStore.get();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingKeys = new Set(
    state.notifications
      .filter((item) => item.kind === 'VACANCY_CLOSING_SOON')
      .map((item) => item.eventKey),
  );
  const closingNotifications = state.jobs.flatMap((job) => {
    if (job.employerId !== employerId || job.status !== 'Active') {
      return [];
    }

    const [year, month, day] = job.deadline.split('-').map(Number);
    const deadline = new Date(year, month - 1, day);
    const daysRemaining = Math.round((deadline.getTime() - today.getTime()) / 86400000);
    const eventKey = `vacancy-closing:${job.id}:${job.deadline}`;
    if (daysRemaining < 0 || daysRemaining > 7 || existingKeys.has(eventKey)) {
      return [];
    }

    return [
      createNotification({
        userId: employerId,
        title: 'Vacancy closing soon',
        detail: `${job.title} ${daysRemaining === 0 ? 'closes today' : daysRemaining === 1 ? 'closes tomorrow' : `closes in ${daysRemaining} days`}.`,
        kind: 'VACANCY_CLOSING_SOON',
        href: `/employer/jobs/${job.id}`,
        jobId: job.id,
        eventKey,
      }),
    ];
  });

  if (closingNotifications.length) {
    mockStore.set((current) => ({
      ...current,
      notifications: [...closingNotifications, ...current.notifications],
    }));
  }
}

/* ------------------------------------------------------------------ */
/* Seekers                                                             */
/* ------------------------------------------------------------------ */

export function getProfile(userId: string | undefined): SeekerProfile | undefined {
  if (!userId) {
    return undefined;
  }
  return mockStore.get().profiles.find((profile) => profile.userId === userId);
}

export function saveProfile(profile: SeekerProfile): void {
  mockStore.set((state) => {
    const exists = state.profiles.some((item) => item.userId === profile.userId);
    return {
      ...state,
      profiles: exists
        ? state.profiles.map((item) =>
            item.userId === profile.userId ? profile : item,
          )
        : [...state.profiles, profile],
    };
  });
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export function getNotifications(userId: string | undefined): NotificationItem[] {
  if (!userId) {
    return [];
  }
  return mockStore
    .get()
    .notifications.filter((notification) => notification.userId === userId);
}

export function markNotificationsRead(userId: string): void {
  mockStore.set((state) => ({
    ...state,
    notifications: state.notifications.map((notification) =>
      notification.userId === userId ? { ...notification, read: true } : notification,
    ),
  }));
}

export function markNotificationRead(userId: string, notificationId: string): void {
  mockStore.set((state) => ({
    ...state,
    notifications: state.notifications.map((notification) =>
      notification.userId === userId && notification.id === notificationId
        ? { ...notification, read: true }
        : notification,
    ),
  }));
}
