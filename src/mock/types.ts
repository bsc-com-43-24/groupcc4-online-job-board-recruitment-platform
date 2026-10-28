/**
 * Shared domain types for the frontend demo.
 *
 * These mirror the shape the future backend is expected to return, so screens
 * never need to change when the mock store is swapped for a real API.
 */

export type Role = 'SEEKER' | 'EMPLOYER';

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export type WorkMode = 'On-site' | 'Hybrid' | 'Remote';

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
  | 'Rejected';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
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
  /** ISO date (yyyy-mm-dd). */
  createdAt: string;
  read: boolean;
}

export interface MockState {
  jobs: Job[];
  applications: Application[];
  profiles: SeekerProfile[];
  accounts: Account[];
  notifications: NotificationItem[];
}
