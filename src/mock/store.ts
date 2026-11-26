import { createExternalStore } from '@/lib/createExternalStore';
import {
  adminApi,
  ApiRequestError,
  apiErrorMessage,
  applicationApi,
  employerApi,
  jobApi,
  profileApi,
  type ApplicationResponse,
  type CompanyResponse,
  type DocumentResponse,
  type EmployerUpgradeResponse,
  type JobResponse,
  type ProfileResponse,
  type ShortlistCandidateResponse,
  type UserResponse,
} from '@/services/api';
import {
  getSession,
  updateSessionName,
  type Session,
} from '@/services/session';
import type {
  AdminUserView,
  Application,
  ApplicationStatus,
  CompanyView,
  DocumentView,
  EmployerRequestView,
  Job,
  JobCategory,
  JobType,
  MockState,
  NotificationItem,
  SeekerProfile,
  ShortlistView,
  WorkMode,
} from './types';

const NOTIFICATIONS_KEY = 'cc4.notifications.v1';
const PROFILE_PICTURE_PREFIX = 'cc4.profile-picture.';

function readNotifications(): NotificationItem[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as NotificationItem[]) : [];
  } catch {
    return [];
  }
}

function writeNotifications(notifications: NotificationItem[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch {
    return;
  }
}

function readProfilePicture(userId: string | undefined): string | undefined {
  if (!userId || typeof window === 'undefined') {
    return undefined;
  }
  return window.localStorage.getItem(`${PROFILE_PICTURE_PREFIX}${userId}`) ?? undefined;
}

function writeProfilePicture(userId: string, value: string | undefined): void {
  if (typeof window === 'undefined') {
    return;
  }
  const key = `${PROFILE_PICTURE_PREFIX}${userId}`;
  try {
    if (value) {
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    return;
  }
}

export const EMPTY_STATE: MockState = {
  jobs: [],
  applications: [],
  profiles: [],
  notifications: [],
  companies: [],
  employerRequests: [],
  adminUsers: [],
  shortlistedCandidates: [],
  documents: [],
  loading: false,
  error: null,
};

const initialNotifications = readNotifications();

export const mockStore = createExternalStore<MockState>({
  ...EMPTY_STATE,
  notifications: initialNotifications,
});

if (typeof window !== 'undefined') {
  mockStore.subscribe(() => {
    writeNotifications(mockStore.get().notifications);
  });
}

let loadGeneration = 0;
let activeLoadKey: string | null = null;
let activeLoad: Promise<void> | null = null;

function inferJobCategory(job: Pick<Job, 'title' | 'description'> & { skills?: string[] }): JobCategory {
  const details = `${job.title} ${job.description} ${(job.skills ?? []).join(' ')}`.toLowerCase();
  if (/marketing|campaign|copywriting|social media/.test(details)) {
    return 'Marketing';
  }
  if (/sales|business development/.test(details)) {
    return 'Sales';
  }
  if (/finance|accounting|bookkeep|reconciliation|analyst|analytics/.test(details)) {
    return 'Business & Finance';
  }
  if (/ux|research|design|usability/.test(details)) {
    return 'Design & Research';
  }
  return 'Technology';
}

function detectWorkMode(text: string): WorkMode {
  if (/remote|work from home|fully remote/i.test(text)) {
    return 'Remote';
  }
  if (/hybrid/i.test(text)) {
    return 'Hybrid';
  }
  return 'On-site';
}

function detectJobType(text: string): JobType {
  if (/internship|intern\b/i.test(text)) {
    return 'Internship';
  }
  if (/contract|contractor/i.test(text)) {
    return 'Contract';
  }
  if (/part[- ]time/i.test(text)) {
    return 'Part-time';
  }
  return 'Full-time';
}

function toDateKey(value: string | undefined, fallback = ''): string {
  if (!value) {
    return fallback;
  }
  return value.slice(0, 10);
}

function splitLines(value: string | undefined): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
}

function fromJobResponse(response: JobResponse, companyName?: string): Job {
  const details = `${response.title}\n${response.description}\n${response.requiredQualifications}`;
  const lines = splitLines(response.description);
  const summary = lines[0]?.slice(0, 220) ?? response.description.slice(0, 220);
  const responsibilityStart = lines.findIndex((line) => /responsibilit/i.test(line));
  const responsibilities =
    responsibilityStart >= 0
      ? lines.slice(responsibilityStart + 1).filter((line) => !/qualification|requirement/i.test(line))
      : [];
  const qualificationLines = splitLines(response.requiredQualifications);
  const skillsLine = qualificationLines.find((line) => /^skills?\s*:/i.test(line));
  const skills = skillsLine
    ? skillsLine
        .replace(/^skills?\s*:\s*/i, '')
        .split(/[,;|]/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return {
    id: response.id,
    employerId: response.employerId,
    companyId: response.companyId,
    title: response.title,
    company: companyName || 'Employer',
    location: response.location,
    category: inferJobCategory({ title: response.title, description: details, skills }),
    workMode: detectWorkMode(details),
    type: detectJobType(details),
    currency: 'MWK',
    salaryMin: 0,
    salaryMax: 0,
    summary,
    description: response.description,
    responsibilities,
    qualifications: qualificationLines.filter((line) => line !== skillsLine),
    skills,
    postedAt: toDateKey(response.createdAt, toDateKey(response.dueDate)),
    deadline: response.dueDate,
    status: response.status === 'ACTIVE' ? 'Active' : 'Closed',
  };
}

function fromApplicationResponse(response: ApplicationResponse): Application {
  const name =
    response.applicantDisplayName ||
    response.applicantProfile?.displayName ||
    response.applicantProfile?.fullName ||
    'Applicant';

  return {
    id: response.id,
    jobId: response.jobId,
    seekerId: response.applicantId,
    seekerName: name,
    seekerEmail: '',
    appliedAt: toDateKey(response.submittedAt),
    status:
      response.status === 'SHORTLISTED'
        ? 'Shortlisted'
        : response.status === 'REJECTED'
          ? 'Rejected'
          : 'Submitted',
    coverLetter: response.coverLetter,
    cvName: response.cv?.originalFilename,
  };
}

function biographyToDetails(biography: string | undefined): Pick<
  SeekerProfile,
  'headline' | 'skills' | 'education' | 'experience'
> {
  const result = { headline: '', skills: [] as string[], education: '', experience: '' };
  if (!biography) {
    return result;
  }

  biography.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    const match = line.match(/^(Headline|Skills|Education|Experience):\s*(.*)$/i);
    if (!match) {
      return;
    }
    const [, key, value = ''] = match;
    if (/headline/i.test(key)) {
      result.headline = value;
    } else if (/skills/i.test(key)) {
      result.skills = value
        .split(/[,;|]/)
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (/education/i.test(key)) {
      result.education = value;
    } else if (/experience/i.test(key)) {
      result.experience = value;
    }
  });

  return result;
}

function detailsToBiography(profile: SeekerProfile): string {
  return [
    profile.headline ? `Headline: ${profile.headline}` : '',
    profile.skills.length ? `Skills: ${profile.skills.join(', ')}` : '',
    profile.education ? `Education: ${profile.education}` : '',
    profile.experience ? `Experience: ${profile.experience}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function fromProfileResponse(
  response: ProfileResponse,
  userId: string,
  email: string,
  documents: DocumentResponse[],
): SeekerProfile {
  const details = biographyToDetails(response.biography);
  return {
    userId,
    fullName: response.fullName || response.displayName || email.split('@')[0],
    email,
    headline: details.headline,
    phone: response.phone ?? '',
    location: response.location ?? '',
    skills: details.skills,
    education: details.education,
    experience: details.experience,
    dateOfBirth: response.dateOfBirth,
    cvName: documents[0]?.originalFilename,
    profilePicture: readProfilePicture(userId),
  };
}

function fromCompanyResponse(response: CompanyResponse): CompanyView {
  return {
    id: response.id,
    name: response.name,
    description: response.description,
    contactEmail: response.contactEmail,
    contactPhone: response.contactPhone,
    location: response.location,
    vatNumber: response.vatNumber,
    registrationNumber: response.registrationNumber,
  };
}

function fromEmployerRequest(response: EmployerUpgradeResponse): EmployerRequestView {
  return {
    id: response.id,
    userId: response.userId,
    companyName: response.companyName,
    businessDescription: response.businessDescription,
    contactEmail: response.contactEmail,
    contactPhone: response.contactPhone,
    location: response.location,
    status: response.status,
    rejectionReason: response.rejectionReason,
    vatNumber: response.vatNumber,
    registrationNumber: response.registrationNumber,
    companyId: response.companyId,
    documentOriginalFilename: response.documentOriginalFilename,
    createdAt: response.createdAt,
  };
}

function fromAdminUser(response: UserResponse): AdminUserView {
  return {
    id: response.id,
    email: response.email,
    role: response.role,
    accountStatus: response.accountStatus,
    createdAt: response.createdAt,
  };
}

function fromShortlist(response: ShortlistCandidateResponse): ShortlistView {
  return {
    id: response.id,
    applicationId: response.applicationId,
    jobId: response.jobId,
    jobTitle: response.jobTitle,
    jobSeekerId: response.jobSeekerId,
    applicantName:
      response.applicantProfile?.displayName ||
      response.applicantProfile?.fullName ||
      'Applicant',
    applicantEmail: response.applicantProfile?.phone,
    cvName: response.cv?.originalFilename,
    shortlistedAt: response.shortlistedAt,
  };
}

function fromDocument(response: DocumentResponse): DocumentView {
  return {
    id: response.id,
    name: response.originalFilename,
    contentType: response.contentType,
    byteSize: response.byteSize,
    createdAt: response.createdAt,
  };
}

function settledValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === 'fulfilled' ? result.value : fallback;
}

function settledError(result: PromiseSettledResult<unknown>): string | null {
  return result.status === 'rejected' ? apiErrorMessage(result.reason) : null;
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

function addNotification(input: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): void {
  const state = mockStore.get();
  mockStore.set({
    ...state,
    notifications: [createNotification(input), ...state.notifications],
  });
}

function withClosingNotifications(
  jobs: Job[],
  employerId: string,
  existing: NotificationItem[],
): NotificationItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existingKeys = new Set(
    existing
      .filter((item) => item.kind === 'VACANCY_CLOSING_SOON')
      .map((item) => item.eventKey),
  );

  const closing = jobs.flatMap((job) => {
    if (job.employerId !== employerId || job.status !== 'Active' || !job.deadline) {
      return [];
    }
    const [year, month, day] = job.deadline.split('-').map(Number);
    const deadline = new Date(year, month - 1, day);
    const daysRemaining = Math.round((deadline.getTime() - today.getTime()) / 86_400_000);
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

  return closing.length ? [...closing, ...existing] : existing;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadAppData(
  session: Session | null = getSession(),
  force = false,
): Promise<void> {
  const sessionKey = session
    ? `${session.userId}:${session.role}:${session.email}:${session.name}`
    : 'anonymous';
  if (!force && activeLoad && activeLoadKey === sessionKey) {
    return activeLoad;
  }

  const pendingLoad = loadAppDataOnce(session);
  activeLoadKey = sessionKey;
  activeLoad = pendingLoad;
  void pendingLoad.then(
    () => {
      if (activeLoad === pendingLoad) {
        activeLoad = null;
        activeLoadKey = null;
      }
    },
    () => {
      if (activeLoad === pendingLoad) {
        activeLoad = null;
        activeLoadKey = null;
      }
    },
  );
  return pendingLoad;
}

async function loadAppDataOnce(session: Session | null): Promise<void> {
  const generation = ++loadGeneration;

  if (!session) {
    mockStore.set({
      ...EMPTY_STATE,
      notifications: readNotifications(),
    });
    return;
  }

  const previous = mockStore.get();
  mockStore.set({ ...previous, loading: true, error: null });

  const jobTask =
    session.role === 'JOB_SEEKER'
      ? jobApi.browse({ page: 0, size: 100 }).then((page) => page.content)
      : session.role === 'EMPLOYER'
        ? employerApi.myJobs(0, 100).then((page) => page.content)
        : Promise.resolve([] as JobResponse[]);

  const applicationTask =
    session.role === 'JOB_SEEKER'
      ? applicationApi.mine()
      : session.role === 'EMPLOYER'
        ? employerApi.employerApplications()
        : Promise.resolve([] as ApplicationResponse[]);

  const profileTask =
    session.role === 'JOB_SEEKER'
      ? profileApi.get()
      : Promise.resolve(null as ProfileResponse | null);

  const documentTask =
    session.role === 'JOB_SEEKER' ? profileApi.documents() : Promise.resolve([] as DocumentResponse[]);

  const companyTask =
    session.role === 'EMPLOYER' ? employerApi.companies() : Promise.resolve([] as CompanyResponse[]);

  const requestTask =
    session.role === 'EMPLOYER'
      ? employerApi.myRequests()
      : session.role === 'ADMIN'
        ? adminApi.employerRequests()
        : Promise.resolve([] as EmployerUpgradeResponse[]);

  const shortlistTask =
    session.role === 'EMPLOYER'
      ? employerApi.shortlist(0, 100).then((page) => page.content)
      : Promise.resolve([] as ShortlistCandidateResponse[]);

  const adminTask =
    session.role === 'ADMIN'
      ? adminApi.users()
      : Promise.resolve([] as UserResponse[]);

  const results = await Promise.allSettled([
    jobTask,
    applicationTask,
    profileTask,
    documentTask,
    companyTask,
    requestTask,
    shortlistTask,
    adminTask,
  ]);

  if (generation !== loadGeneration) {
    return;
  }

  const errors = results.map(settledError).filter((item): item is string => Boolean(item));
  const jobsResponse = settledValue(results[0] as PromiseSettledResult<JobResponse[]>, []);
  const applicationsResponse = settledValue(
    results[1] as PromiseSettledResult<ApplicationResponse[]>,
    [],
  );
  const profile = settledValue(
    results[2] as PromiseSettledResult<ProfileResponse | null>,
    null,
  );
  const documentsResponse = settledValue(
    results[3] as PromiseSettledResult<DocumentResponse[]>,
    [],
  );
  const companiesResponse = settledValue(
    results[4] as PromiseSettledResult<CompanyResponse[]>,
    [],
  );
  const requestsResponse = settledValue(
    results[5] as PromiseSettledResult<EmployerUpgradeResponse[]>,
    [],
  );
  const shortlistResponse = settledValue(
    results[6] as PromiseSettledResult<ShortlistCandidateResponse[]>,
    [],
  );
  const adminResponse = settledValue(results[7] as PromiseSettledResult<UserResponse[]>, []);

  const companies = companiesResponse.map(fromCompanyResponse);
  const companyNames = new Map(companies.map((company) => [company.id, company.name]));
  const jobs = jobsResponse.map((job) => fromJobResponse(job, companyNames.get(job.companyId)));
  const notifications = withClosingNotifications(
    jobs,
    session.userId,
    readNotifications(),
  );

  const profiles: SeekerProfile[] = [];
  if (profile) {
    const seekerProfile = fromProfileResponse(
      profile,
      session.userId,
      session.email,
      documentsResponse,
    );
    profiles.push(seekerProfile);
    if (seekerProfile.fullName && seekerProfile.fullName !== session.name) {
      updateSessionName(seekerProfile.fullName);
    }
  }

  mockStore.set({
    ...EMPTY_STATE,
    jobs,
    applications: applicationsResponse.map(fromApplicationResponse),
    profiles,
    companies,
    employerRequests: requestsResponse.map(fromEmployerRequest),
    shortlistedCandidates: shortlistResponse.map(fromShortlist),
    adminUsers: adminResponse.map(fromAdminUser),
    documents: documentsResponse.map(fromDocument),
    notifications,
    error: errors.length ? errors.join(' ') : null,
  });
}

export function refreshAppData(): Promise<void> {
  return loadAppData(getSession(), true);
}

export function resetMockStore(): Promise<void> {
  return loadAppData(null, true);
}

export async function loadJob(id: string): Promise<Job | undefined> {
  const response = await jobApi.get(id);
  const state = mockStore.get();
  const companyName = (state.companies ?? []).find(
    (company) => company.id === response.companyId,
  )?.name;
  const job = fromJobResponse(response, companyName);

  mockStore.set((current) => ({
    ...current,
    jobs: current.jobs.some((item) => item.id === id)
      ? current.jobs.map((item) => (item.id === id ? job : item))
      : [job, ...current.jobs],
  }));

  return job;
}

export function getJobById(id: string | undefined): Job | undefined {
  if (!id) {
    return undefined;
  }
  return mockStore.get().jobs.find((job) => job.id === id);
}

export function hasApplied(jobId: string, seekerId: string | undefined): boolean {
  if (!seekerId) {
    return false;
  }
  return mockStore
    .get()
    .applications.some(
      (application) => application.jobId === jobId && application.seekerId === seekerId,
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
      (application) => application.jobId === jobId && application.seekerId === seekerId,
    );
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function toJobInput(job: Job, companyId?: string) {
  const resolvedCompanyId =
    companyId ??
    job.companyId ??
    (mockStore.get().companies ?? [])[0]?.id;

  if (!resolvedCompanyId) {
    throw new ApiRequestError(
      'Create a company before posting a job.',
      'client',
    );
  }

  const responsibilities = job.responsibilities.length
    ? `Responsibilities:\n${job.responsibilities.map((item) => `- ${item}`).join('\n')}`
    : '';
  const skills = job.skills.length ? `Skills: ${job.skills.join(', ')}` : '';
  const qualifications = [
    job.qualifications.join('\n'),
    skills,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    companyId: resolvedCompanyId,
    title: truncate(job.title, 255),
    description: truncate([job.summary, job.description, responsibilities].filter(Boolean).join('\n\n'), 10000),
    requiredQualifications: truncate(qualifications, 5000),
    dueDate: job.deadline,
    location: truncate(job.location, 255),
  };
}

export async function createJob(
  input: Omit<Job, 'id' | 'postedAt'> & { companyId?: string },
): Promise<Job> {
  const response = await jobApi.create(toJobInput(input as Job));
  await refreshAppData();
  return fromJobResponse(response);
}

export async function updateJob(id: string, patch: Partial<Job>): Promise<void> {
  const current = getJobById(id);
  if (!current) {
    throw new ApiRequestError('The job could not be found.', 'client');
  }
  await jobApi.update(id, toJobInput({ ...current, ...patch }));
  await refreshAppData();
}

export async function closeJob(id: string): Promise<void> {
  await jobApi.close(id);
  await refreshAppData();
}

export async function deleteJob(id: string): Promise<void> {
  await jobApi.remove(id);
  await refreshAppData();
}

export async function applyToJob(input: {
  job: Job;
  seekerId: string;
  seekerName: string;
  seekerEmail: string;
  coverLetter?: string;
  cvFile?: File;
  cvName?: string;
}): Promise<Application | null> {
  if (hasApplied(input.job.id, input.seekerId)) {
    return null;
  }
  if (!input.cvFile) {
    throw new ApiRequestError('Upload a PDF CV before applying.', 'client');
  }

  const response = await applicationApi.apply({
    jobId: input.job.id,
    cv: input.cvFile,
    coverLetter: input.coverLetter ?? '',
  });

  addNotification({
    userId: input.job.employerId,
    title: 'New application received',
    detail: `${input.seekerName} applied for ${input.job.title}.`,
    kind: 'NEW_APPLICATION',
    href: `/employer/jobs/${input.job.id}`,
    applicationId: response.id,
    jobId: input.job.id,
  });
  await refreshAppData();
  return fromApplicationResponse(response);
}

function toApiStatus(status: ApplicationStatus): 'PENDING' | 'SHORTLISTED' | 'REJECTED' | null {
  if (status === 'Shortlisted') {
    return 'SHORTLISTED';
  }
  if (status === 'Rejected') {
    return 'REJECTED';
  }
  if (status === 'Submitted') {
    return 'PENDING';
  }
  return null;
}

export async function setApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
): Promise<boolean> {
  const apiStatus = toApiStatus(status);
  if (!apiStatus) {
    return false;
  }

  await employerApi.setApplicationStatus(applicationId, apiStatus);
  const application = mockStore.get().applications.find((item) => item.id === applicationId);
  const job = application
    ? mockStore.get().jobs.find((item) => item.id === application.jobId)
    : undefined;

  if (application && status === 'Shortlisted') {
    addNotification({
      userId: application.seekerId,
      title: 'Your application was shortlisted',
      detail: `${job?.company ?? 'The employer'} updated your application for ${job?.title ?? 'a vacancy'} to ${status}.`,
      kind: 'APPLICATION_STATUS',
      href: `/seeker/applications#application-${application.id}`,
      applicationId: application.id,
      jobId: application.jobId,
    });
  }
  if (application && status === 'Rejected') {
    addNotification({
      userId: application.seekerId,
      title: 'Your application was not selected',
      detail: `${job?.company ?? 'The employer'} updated your application for ${job?.title ?? 'a vacancy'} to ${status}.`,
      kind: 'APPLICATION_STATUS',
      href: `/seeker/applications#application-${application.id}`,
      applicationId: application.id,
      jobId: application.jobId,
    });
  }

  await refreshAppData();
  return true;
}

export async function withdrawApplication(applicationId: string): Promise<boolean> {
  const application = mockStore.get().applications.find((item) => item.id === applicationId);
  if (!application || application.status === 'Rejected') {
    return false;
  }

  await applicationApi.withdraw(applicationId);
  const job = mockStore.get().jobs.find((item) => item.id === application.jobId);
  addNotification({
    userId: job?.employerId ?? application.seekerId,
    title: 'Application withdrawn',
    detail: `${application.seekerName} withdrew their application for ${job?.title ?? 'a vacancy'}.`,
    kind: 'APPLICATION_WITHDRAWN',
    href: job ? `/employer/jobs/${job.id}` : '/seeker/applications',
    applicationId: application.id,
    jobId: application.jobId,
  });
  await refreshAppData();
  return true;
}

export function syncVacancyClosingNotifications(employerId: string): void {
  const state = mockStore.get();
  const notifications = withClosingNotifications(state.jobs, employerId, state.notifications);
  if (notifications !== state.notifications) {
    mockStore.set({ ...state, notifications });
  }
}

export async function saveProfile(
  profile: SeekerProfile & { cvFile?: File },
): Promise<void> {
  await profileApi.update({
    displayName: profile.fullName || profile.headline || profile.email.split('@')[0],
    fullName: profile.fullName || undefined,
    dateOfBirth: profile.dateOfBirth || undefined,
    phone: profile.phone || undefined,
    location: profile.location || undefined,
    biography: detailsToBiography(profile) || undefined,
  });

  if (profile.cvFile) {
    await profileApi.uploadDocument(profile.cvFile);
  }

  writeProfilePicture(profile.userId, profile.profilePicture);
  updateSessionName(profile.fullName || profile.headline || profile.email.split('@')[0]);
  await refreshAppData();
}

export function getNotifications(userId: string | undefined): NotificationItem[] {
  if (!userId) {
    return [];
  }
  return mockStore.get().notifications.filter((notification) => notification.userId === userId);
}

export function markNotificationsRead(userId: string): void {
  const state = mockStore.get();
  mockStore.set({
    ...state,
    notifications: state.notifications.map((notification) =>
      notification.userId === userId ? { ...notification, read: true } : notification,
    ),
  });
}

export function markNotificationRead(userId: string, notificationId: string): void {
  const state = mockStore.get();
  mockStore.set({
    ...state,
    notifications: state.notifications.map((notification) =>
      notification.userId === userId && notification.id === notificationId
        ? { ...notification, read: true }
        : notification,
    ),
  });
}

export const apiBackedStore = mockStore;
