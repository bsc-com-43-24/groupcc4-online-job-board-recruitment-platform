export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  salary: string;
  description: string;
  deadline: string;
};

export const jobs: Job[] = [
  { id: 1, title: 'Junior Web Developer', company: 'TechMw', location: 'Zomba', type: 'Full-time', salary: 'MWK 600,000', description: 'Build and maintain web apps.', deadline: '2026-11-30' },
  { id: 2, title: 'Accounts Clerk', company: 'Lilongwe Traders', location: 'Lilongwe', type: 'Full-time', salary: 'MWK 450,000', description: 'Handle daily bookkeeping.', deadline: '2026-11-20' },
  { id: 3, title: 'Data Entry Assistant', company: 'Blantyre Logistics', location: 'Blantyre', type: 'Contract', salary: 'MWK 300,000', description: 'Enter and verify records.', deadline: '2026-11-15' },
];

export type ApplicationStatus = 'Submitted' | 'Shortlisted' | 'Rejected' | 'Hired';

export const applications = [
  { id: 1, jobId: 1, status: 'Submitted' as ApplicationStatus },
  { id: 2, jobId: 2, status: 'Shortlisted' as ApplicationStatus },
]; 
export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  salary: string;
  description: string;
  deadline: string;
  status?: 'Active' | 'Closed' | 'Draft';
};

export type ApplicationStatus = 'Submitted' | 'Shortlisted' | 'Rejected' | 'Hired';

export type Applicant = {
  id: number;
  jobId: number;
  name: string;
  email: string;
  dateApplied: string;
  status: ApplicationStatus;
  resumeUrl?: string;
};

export const jobs: Job[] = [
  { id: 1, title: 'Junior Web Developer', company: 'TechMw', location: 'Zomba', type: 'Full-time', salary: 'MWK 600,000', description: 'Build and maintain web apps.', deadline: '2026-11-30', status: 'Active' },
  { id: 2, title: 'Accounts Clerk', company: 'Lilongwe Traders', location: 'Lilongwe', type: 'Full-time', salary: 'MWK 450,000', description: 'Handle daily bookkeeping.', deadline: '2026-11-20', status: 'Active' },
  { id: 3, title: 'Data Entry Assistant', company: 'Blantyre Logistics', location: 'Blantyre', type: 'Contract', salary: 'MWK 300,000', description: 'Enter and verify records.', deadline: '2026-11-15', status: 'Active' },
];

export const applicants: Applicant[] = [
  { id: 1, jobId: 1, name: 'Chifundo Banda', email: 'chifundo@example.com', dateApplied: '2026-10-25', status: 'Submitted' },
  { id: 2, jobId: 1, name: 'Kondwani Phiri', email: 'kondwani@example.com', dateApplied: '2026-10-20', status: 'Shortlisted' },
  { id: 3, jobId: 2, name: 'Tiwonge Moyo', email: 'tiwonge@example.com', dateApplied: '2026-10-22', status: 'Shortlisted' },
];