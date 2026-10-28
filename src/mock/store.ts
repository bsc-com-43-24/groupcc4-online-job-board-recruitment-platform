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

  mockStore.set((state) => ({
    ...state,
    applications: [application, ...state.applications],
  }));

  return application;
}

export function setApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
): void {
  mockStore.set((state) => ({
    ...state,
    applications: state.applications.map((application) =>
      application.id === applicationId ? { ...application, status } : application,
    ),
  }));
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
