/**
 * Shared domain types for the frontend demo.
 *
 * These mirror the shape the future backend is expected to return, so screens
 * never need to change when the mock store is swapped for a real API.
 */

export type Role = 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export type WorkMode = 'On-site' | 'Hybrid' | 'Remote';

export type JobCategory =
  | 'Technology'
  | 'Marketing'
  | 'Business & Finance'
  | 'Sales'
  | 'Design & Research';

export type JobStatus = 'Active' | 'Closed';

/**
 * The single application lifecycle used by every screen. Previously four
 * different vocabularies existed for the same states.
 */
export type ApplicationStatus = 'Submitted' | 'Shortlisted' | 'Rejected';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Submitted',
  'Shortlisted',
  'Rejected',
];

export interface Job {
  id: string;
  employerId: string;
  companyId?: string;
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
  dateOfBirth?: string;
  cvName?: string;
  profilePicture?: string;
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
    | 'GENERAL';
  href?: string;
  applicationId?: string;
  jobId?: string;
  eventKey?: string;
}

export interface CompanyView {
  id: string;
  name: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  location?: string;
  vatNumber?: string;
  registrationNumber?: string;
}

export interface EmployerRequestView {
  id: string;
  userId: string;
  companyName: string;
  businessDescription: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  vatNumber?: string;
  registrationNumber?: string;
  companyId?: string;
  documentOriginalFilename?: string;
  createdAt?: string;
}

export interface AdminUserView {
  id: string;
  email: string;
  role: Role;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
  createdAt?: string;
}

export interface ShortlistView {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  jobSeekerId: string;
  applicantName: string;
  applicantEmail?: string;
  cvName?: string;
  shortlistedAt?: string;
}

export interface DocumentView {
  id: string;
  name: string;
  contentType: string;
  byteSize: number;
  createdAt?: string;
}

export interface MockState {
  jobs: Job[];
  applications: Application[];
  profiles: SeekerProfile[];
  notifications: NotificationItem[];
  companies?: CompanyView[];
  employerRequests?: EmployerRequestView[];
  adminUsers?: AdminUserView[];
  shortlistedCandidates?: ShortlistView[];
  documents?: DocumentView[];
  loading?: boolean;
  error?: string | null;
}
