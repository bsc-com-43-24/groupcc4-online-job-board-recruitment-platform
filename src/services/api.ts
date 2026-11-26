import { clearSession } from '@/services/session';
import type { Role } from '@/mock/types';

const BASE_URL = '';

export const apiConfigured = true;
export const apiBaseUrl = '/api';
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export interface ApiFieldError {
  field?: string;
  message?: string;
}

export interface ApplicationErrorResponse {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
  correlationId: string;
  fieldErrors: { field: string; message: string }[];
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly kind: 'network' | 'http' | 'client',
    readonly status?: number,
    readonly code?: string,
    readonly fieldErrors: ApiFieldError[] = [],
    readonly retryAfter?: number,
    readonly response?: ApplicationErrorResponse,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

interface ApiErrorPayload {
  timestamp?: string;
  status?: number;
  message?: string;
  error?: string;
  code?: string;
  path?: string;
  correlationId?: string;
  errors?: ApiFieldError[];
  fieldErrors?: Record<string, string> | ApiFieldError[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RegisterResponse {
  id: string;
  email: string;
  role: Role;
  status: 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
}

export interface PasswordResetResponse {
  message?: string;
  resetToken?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  role: Role;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
  createdAt?: string;
  updatedAt?: string;
}

interface CurrentUserResponse {
  id: string;
  email: string;
  role: Role;
  status: 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
}

export interface CompanyResponse {
  id: string;
  employerId: string;
  name: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  location?: string;
  vatNumber?: string;
  registrationNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyInput {
  name: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  location?: string;
}

export interface JobResponse {
  id: string;
  employerId: string;
  companyId: string;
  title: string;
  description: string;
  requiredQualifications: string;
  dueDate: string;
  location: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CLOSED';
  createdAt?: string;
  updatedAt?: string;
}

export interface JobInput {
  companyId: string;
  title: string;
  description: string;
  requiredQualifications: string;
  dueDate: string;
  location: string;
}

export interface JobSummaryResponse {
  id: string;
  title: string;
  location: string;
  dueDate: string;
  status: string;
}

export interface ApplicationProfileResponse {
  displayName: string;
  fullName: string;
  dateOfBirth: string;
  phone: string;
  location: string;
  biography: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationCvResponse {
  id: string;
  originalFilename: string;
  contentType: string;
  byteSize: number;
  createdAt: string;
}

export interface ProfileResponse {
  displayName: string;
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  location?: string;
  biography?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileInput {
  displayName: string;
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  location?: string;
  biography?: string;
}

export interface DocumentResponse {
  id: string;
  originalFilename: string;
  contentType: string;
  byteSize: number;
  createdAt?: string;
}

export type ApplicationStatusResponse = 'PENDING' | 'SHORTLISTED' | 'REJECTED';

export interface ApplicationResponse {
  id: string;
  jobId: string;
  applicantId: string;
  applicantDisplayName: string;
  applicantProfile: ApplicationProfileResponse;
  cv: ApplicationCvResponse;
  status: ApplicationStatusResponse;
  submittedAt: string;
  updatedAt: string;
  shortlistedAt: string | null;
  rejectedAt: string | null;
  job: JobSummaryResponse;
  coverLetter: string;
}

export interface EmployerUpgradeResponse {
  id: string;
  userId: string;
  companyName: string;
  businessDescription: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  vatNumber?: string;
  registrationNumber?: string;
  companyId?: string;
  documentOriginalFilename?: string;
  documentContentType?: string;
  documentSize?: number;
}

export interface EmployerUpgradeInput {
  companyName: string;
  businessDescription: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  vatNumber: string;
  registrationNumber: string;
  document: File;
}

export interface ShortlistCandidateResponse {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  jobSeekerId: string;
  applicantProfile?: ProfileResponse;
  cv?: DocumentResponse;
  shortlistedAt?: string;
  retainedAt?: string;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  token?: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  redirectOnUnauthorized?: boolean;
}

function normalizeFieldErrors(payload: ApiErrorPayload): ApiFieldError[] {
  const raw = payload.fieldErrors ?? payload.errors ?? [];
  if (Array.isArray(raw)) {
    return raw.filter((item) => Boolean(item?.message));
  }
  return Object.entries(raw).map(([field, message]) => ({ field, message: String(message) }));
}

function errorPayloadFromText(text: string): ApiErrorPayload {
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text) as ApiErrorPayload;
  } catch {
    return { message: text };
  }
}

export function parseApiErrorResponse(
  text: string,
  responseStatus: number,
): ApplicationErrorResponse | null {
  const payload = errorPayloadFromText(text);
  if (
    typeof payload.timestamp !== 'string' ||
    typeof payload.code !== 'string' ||
    typeof payload.message !== 'string' ||
    typeof payload.path !== 'string' ||
    typeof payload.correlationId !== 'string'
  ) {
    return null;
  }

  const fieldErrors = Array.isArray(payload.fieldErrors)
    ? payload.fieldErrors.filter(
        (item): item is { field: string; message: string } =>
          typeof item?.field === 'string' && typeof item.message === 'string',
      )
    : [];
  return {
    timestamp: payload.timestamp,
    status: typeof payload.status === 'number' ? payload.status : responseStatus,
    code: payload.code,
    message: payload.message,
    path: payload.path,
    correlationId: payload.correlationId,
    fieldErrors,
  };
}

function retryAfterSeconds(header: string | null): number | undefined {
  if (!header) {
    return undefined;
  }

  const seconds = Number(header);
  if (Number.isFinite(seconds)) {
    return Math.max(0, Math.ceil(seconds));
  }

  const timestamp = Date.parse(header);
  if (Number.isNaN(timestamp)) {
    return undefined;
  }

  return Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const origin =
    typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
  const url = new URL(`${BASE_URL}${path}`, origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

export function validateUpload(file: File): string | null {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    return 'Only PDF files are accepted.';
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return 'The file must be 5 MB or smaller.';
  }
  return null;
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    auth = true,
    query,
    redirectOnUnauthorized = auth,
  } = options;
  const token = auth ? options.token ?? getStoredToken() : null;
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payloadBody: BodyInit | undefined;
  if (body instanceof FormData) {
    payloadBody = body;
  } else if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
    payloadBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: payloadBody,
    });
  } catch {
    throw new ApiRequestError(
      'Could not reach the server. Check your connection and try again.',
      'network',
    );
  }

  const text = await response.text();
  const payload = errorPayloadFromText(text);

  if (!response.ok) {
    const retryAfter = retryAfterSeconds(response.headers.get('retry-after'));
    const apiError = parseApiErrorResponse(text, response.status);

    if (response.status === 401 && redirectOnUnauthorized && typeof window !== 'undefined') {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      clearSession();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.replace(
          `/login?session=expired&next=${encodeURIComponent(currentPath)}`,
        );
      }
    }

    if (response.status >= 500) {
      throw new ApiRequestError(
        'The server is temporarily unavailable. Please try again.',
        'http',
        response.status,
        apiError?.code ?? payload.code,
        apiError?.fieldErrors ?? normalizeFieldErrors(payload),
        retryAfter,
        apiError ?? undefined,
      );
    }

    const message =
      response.status === 429
        ? retryAfter
          ? `Too many attempts. Try again in ${retryAfter} seconds.`
          : 'Too many attempts. Please try again later.'
        : apiError?.message ??
          payload.message ??
          payload.error ??
          'The request could not be completed. Please try again.';

    throw new ApiRequestError(
      message,
      'http',
      response.status,
      apiError?.code ?? payload.code,
      apiError?.fieldErrors ?? normalizeFieldErrors(payload),
      retryAfter,
      apiError ?? undefined,
    );
  }

  if (!text) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!/json/i.test(contentType)) {
    return text as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiRequestError(
      'The server returned an invalid response. Please try again.',
      'http',
      response.status,
    );
  }
}

function multipart(fields: Record<string, string | File | Blob | undefined>): FormData {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) {
      form.append(key, value);
    }
  });
  return form;
}

export function apiRequest<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>(path, options);
}

export const authApi = {
  login(input: { email: string; password: string }): Promise<LoginResponse> {
    return request('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: {
        email: input.email,
        password: input.password,
      },
    });
  },
  register(input: { email: string; password: string }): Promise<RegisterResponse> {
    return request('/api/auth/register', {
      method: 'POST',
      auth: false,
      body: {
        email: input.email,
        password: input.password,
        role: 'JOB_SEEKER',
      },
    });
  },
  currentUser(token?: string): Promise<UserResponse> {
    const options = { token, redirectOnUnauthorized: false };
    return request<CurrentUserResponse>('/api/auth/me', options)
      .then((response) => ({ ...response, accountStatus: response.status }))
      .catch((error: unknown) => {
        if (error instanceof ApiRequestError && error.status === 404) {
          return request<UserResponse>('/api/users/me', options);
        }
        throw error;
      });
  },
  changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
    return request('/api/auth/change-password', {
      method: 'POST',
      body: {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      },
    });
  },
  forgotPassword(email: string): Promise<PasswordResetResponse> {
    return request('/api/auth/forgot-password', {
      method: 'POST',
      auth: false,
      body: { email },
    });
  },
  resetPassword(input: { token: string; password: string }): Promise<PasswordResetResponse> {
    return request('/api/auth/reset-password', {
      method: 'POST',
      auth: false,
      body: {
        resetToken: input.token,
        newPassword: input.password,
      },
    });
  },
  logout(): Promise<void> {
    return request('/api/auth/logout', { method: 'POST' });
  },
};

export const employerApi = {
  submitVerification(input: EmployerUpgradeInput): Promise<EmployerUpgradeResponse> {
    const application = new Blob(
      [
        JSON.stringify({
          companyName: input.companyName,
          businessDescription: input.businessDescription,
          contactEmail: input.contactEmail,
          contactPhone: input.contactPhone,
          location: input.location,
          vatNumber: input.vatNumber,
          registrationNumber: input.registrationNumber,
        }),
      ],
      { type: 'application/json' },
    );
    return request('/api/employer-requests', {
      method: 'POST',
      body: multipart({ application, document: input.document }),
    });
  },
  myRequests(): Promise<EmployerUpgradeResponse[]> {
    return request('/api/employer-requests');
  },
  companies(): Promise<CompanyResponse[]> {
    return request('/api/companies');
  },
  createCompany(input: CompanyInput): Promise<CompanyResponse> {
    return request('/api/companies', { method: 'POST', body: input });
  },
  updateCompany(id: string, input: CompanyInput): Promise<CompanyResponse> {
    return request(`/api/companies/${encodeURIComponent(id)}`, { method: 'PUT', body: input });
  },
  myJobs(page = 0, size = 100, status?: JobResponse['status']): Promise<PageResponse<JobResponse>> {
    return request('/api/employer/jobs', { query: { page, size, status } });
  },
  employerApplications(): Promise<ApplicationResponse[]> {
    return request('/api/employer/applications');
  },
  application(id: string): Promise<ApplicationResponse> {
    return request(`/api/employer/applications/${encodeURIComponent(id)}`);
  },
  shortlist(page = 0, size = 100): Promise<PageResponse<ShortlistCandidateResponse>> {
    return request('/api/employer/shortlisted-candidates', { query: { page, size } });
  },
  setApplicationStatus(id: string, status: ApplicationStatusResponse): Promise<ApplicationResponse> {
    return request(`/api/employer/applications/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },
};

export const jobApi = {
  browse(query: { q?: string; location?: string; page?: number; size?: number } = {}): Promise<PageResponse<JobResponse>> {
    return request('/api/jobs', {
      query: {
        q: query.q,
        location: query.location,
        page: query.page ?? 0,
        size: query.size ?? 100,
      },
    });
  },
  get(id: string): Promise<JobResponse> {
    return request(`/api/jobs/${encodeURIComponent(id)}`);
  },
  create(input: JobInput): Promise<JobResponse> {
    return request('/api/jobs', { method: 'POST', body: input });
  },
  update(id: string, input: JobInput): Promise<JobResponse> {
    return request(`/api/jobs/${encodeURIComponent(id)}`, { method: 'PUT', body: input });
  },
  close(id: string): Promise<JobResponse> {
    return request(`/api/jobs/${encodeURIComponent(id)}/close`, { method: 'PATCH' });
  },
  remove(id: string): Promise<void> {
    return request(`/api/jobs/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};

export const applicationApi = {
  mine(): Promise<ApplicationResponse[]> {
    return request('/api/applications');
  },
  get(id: string): Promise<ApplicationResponse> {
    return request(`/api/applications/${encodeURIComponent(id)}`);
  },
  apply(input: {
    jobId: string;
    cv: File;
    coverLetter: string;
  }): Promise<ApplicationResponse> {
    return request('/api/applications', {
      method: 'POST',
      body: multipart({
        jobId: input.jobId,
        cv: input.cv,
        coverLetter: input.coverLetter,
      }),
    });
  },
  updateCoverLetter(id: string, coverLetter: string): Promise<ApplicationResponse> {
    return request(`/api/applications/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: { coverLetter },
    });
  },
  withdraw(id: string): Promise<void> {
    return request(`/api/applications/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};

export const profileApi = {
  get(): Promise<ProfileResponse> {
    return request('/api/profile');
  },
  update(input: ProfileInput): Promise<ProfileResponse> {
    return request('/api/profile', { method: 'PUT', body: input });
  },
  documents(): Promise<DocumentResponse[]> {
    return request('/api/profile/documents');
  },
  uploadDocument(file: File): Promise<DocumentResponse> {
    return request('/api/profile/documents', {
      method: 'POST',
      body: multipart({ file }),
    });
  },
  deleteDocument(id: string): Promise<void> {
    return request(`/api/profile/documents/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};

export const adminApi = {
  users(): Promise<UserResponse[]> {
    return request('/api/admin/users');
  },
  createUser(input: {
    email: string;
    password: string;
    role: 'JOB_SEEKER' | 'EMPLOYER';
  }): Promise<UserResponse> {
    return request('/api/admin/users', {
      method: 'POST',
      body: {
        ...input,
        roleAllowed: true,
        passwordByteLengthValid: new TextEncoder().encode(input.password).length <= 72,
      },
    });
  },
  suspendUser(id: string): Promise<UserResponse> {
    return request(`/api/admin/users/${encodeURIComponent(id)}/suspend`, { method: 'PATCH' });
  },
  removeUser(id: string): Promise<UserResponse> {
    return request(`/api/admin/users/${encodeURIComponent(id)}/remove`, { method: 'PATCH' });
  },
  assignAdmin(id: string): Promise<UserResponse> {
    return request(`/api/admin/users/${encodeURIComponent(id)}/role`, {
      method: 'PATCH',
      body: { role: 'ADMIN', adminRole: true },
    });
  },
  employerRequests(): Promise<EmployerUpgradeResponse[]> {
    return request('/api/admin/employer-requests');
  },
  employerRequest(id: string): Promise<EmployerUpgradeResponse> {
    return request(`/api/admin/employer-requests/${encodeURIComponent(id)}`);
  },
  approveEmployerRequest(id: string): Promise<EmployerUpgradeResponse> {
    return request(`/api/admin/employer-requests/${encodeURIComponent(id)}/approve`, {
      method: 'PATCH',
    });
  },
  rejectEmployerRequest(id: string, reason: string): Promise<EmployerUpgradeResponse> {
    return request(`/api/admin/employer-requests/${encodeURIComponent(id)}/reject`, {
      method: 'PATCH',
      body: { reason },
    });
  },
};

export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.fieldErrors.length) {
      const detail = error.fieldErrors
        .map((item) => (item.field ? `${item.field}: ${item.message}` : item.message))
        .join('; ');
      return `${error.message} ${detail}`.trim();
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
