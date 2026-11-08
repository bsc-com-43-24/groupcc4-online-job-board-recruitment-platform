/**
 * Shared domain types for the frontend demo.
 *
 * These mirror the shape the future backend is expected to return, so screens
 * never need to change when the mock store is swapped for a real API.
 */

export type Role = 'SEEKER' | 'EMPLOYER';

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export type WorkMode = 'On-site' | 'Hybrid' | 'Remote';

export type JobCategory =
  | 'Technology'
  | 'Marketing'
  | 'Business & Finance'
  | 'Sales'
  | 'Design & Research';

export type JobStatus = 'Draft' | 'Active' | 'Closed';

/**
 * The single application lifecycle used by every screen. Previously four
 * different vocabularies existed for the same states.
 */
export type ApplicationStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interviewed'
  | 'Hired'
  | 'Rejected'
  | 'Withdrawn';

export const APPLICATION_STATUSES: Exclude<ApplicationStatus, 'Withdrawn'>[] = [
  'Submitted',
  'Under Review',
  'Shortlisted',
  'Interviewed',
  'Hired',
  'Rejected',
];

export interface Job {
  id: string;
  employerId: string;
  title: string;
  company: string;
  location: string;
  category?: JobCategory;
  workMode: WorkMode;
  type: JobType;
  currency: string;
  salaryMin: number;
  salaryMax: number;
  summary: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  /** ISO date (yyyy-mm-dd). */
  postedAt: string;
  /** ISO date (yyyy-mm-dd). */
  deadline: string;
  status: JobStatus;
}

export interface Application {
  id: string;
  jobId: string;
  seekerId: string;
  seekerName: string;
  seekerEmail: string;
  /** ISO date (yyyy-mm-dd). */
  appliedAt: string;
  status: ApplicationStatus;
  coverLetter?: string;
  cvName?: string;
  interview?: Interview;
}

export interface Interview {
  /** ISO date (yyyy-mm-dd), interpreted in the employer's local timezone. */
  date: string;
  /** Local time in 24-hour HH:mm format. */
  time: string;
  mode: 'Online' | 'In person';
  location?: string;
  meetingLink?: string;
  notes?: string;
  status: 'Scheduled' | 'Cancelled';
}

export interface SeekerProfile {
  userId: string;
  fullName: string;
  email: string;
  headline: string;
  phone: string;
  location: string;
  skills: string[];
  education: string;
  experience: string;
  cvName?: string;
  profilePicture?: string;
}

export interface Account {
  id: string;
  email: string;
  password: string;
  role: Role;
  name: string;
  companyName?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  detail: string;
  /** ISO timestamp. */
  createdAt: string;
  read: boolean;
  kind?:
    | 'APPLICATION_STATUS'
    | 'NEW_APPLICATION'
    | 'APPLICATION_WITHDRAWN'
    | 'VACANCY_CLOSING_SOON'
    | 'INTERVIEW_SCHEDULED'
    | 'INTERVIEW_UPDATED'
    | 'INTERVIEW_CANCELLED'
    | 'GENERAL';
  href?: string;
  applicationId?: string;
  jobId?: string;
  eventKey?: string;
}

export interface MockState {
  jobs: Job[];
  applications: Application[];
  profiles: SeekerProfile[];
  accounts: Account[];
  notifications: NotificationItem[];
}
