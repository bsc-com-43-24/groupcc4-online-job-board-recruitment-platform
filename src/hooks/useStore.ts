'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import {
  EMPTY_STATE,
  loadAppData,
  mockStore,
} from '@/mock/store';
import { useSession } from '@/services/session';
import type {
  AdminUserView,
  Application,
  CompanyView,
  DocumentView,
  EmployerRequestView,
  Job,
  MockState,
  NotificationItem,
  SeekerProfile,
  ShortlistView,
} from '@/mock/types';

export function useMockState(): MockState {
  const session = useSession();
  const state = useSyncExternalStore(mockStore.subscribe, mockStore.get, () => EMPTY_STATE);
  const sessionKey = session
    ? `${session.userId}:${session.role}:${session.email}:${session.name}`
    : 'anonymous';

  useEffect(() => {
    void loadAppData(session);
  }, [session, sessionKey]);

  return state;
}

export function useJobs(): Job[] {
  return useMockState().jobs;
}

export function usePublishedJobs(): Job[] {
  const jobs = useJobs();
  return useMemo(() => jobs.filter((job) => job.status === 'Active'), [jobs]);
}

export function useJob(id: string | undefined): Job | undefined {
  const jobs = useJobs();
  return useMemo(() => (id ? jobs.find((job) => job.id === id) : undefined), [jobs, id]);
}

export function useApplications(): Application[] {
  return useMockState().applications;
}

export function useSeekerApplications(seekerId: string | undefined): Application[] {
  const applications = useApplications();
  return useMemo(
    () =>
      seekerId
        ? applications
            .filter((application) => application.seekerId === seekerId)
            .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt))
        : [],
    [applications, seekerId],
  );
}

export function useEmployerJobs(employerId: string | undefined): Job[] {
  const jobs = useJobs();
  return useMemo(
    () =>
      employerId ? jobs.filter((job) => job.employerId === employerId) : [],
    [jobs, employerId],
  );
}

export function useEmployerApplications(employerId: string | undefined): Application[] {
  const applications = useApplications();
  const jobs = useJobs();
  return useMemo(() => {
    if (!employerId) {
      return [];
    }
    const ownedJobIds = new Set(
      jobs.filter((job) => job.employerId === employerId).map((job) => job.id),
    );
    return applications
      .filter((application) => ownedJobIds.has(application.jobId))
      .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
  }, [applications, jobs, employerId]);
}

export function useJobApplications(jobId: string | undefined): Application[] {
  const applications = useApplications();
  return useMemo(
    () =>
      jobId
        ? applications
            .filter((application) => application.jobId === jobId)
            .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt))
        : [],
    [applications, jobId],
  );
}

export function useNotifications(userId: string | undefined): NotificationItem[] {
  const notifications = useMockState().notifications;
  return useMemo(
    () =>
      userId
        ? notifications
            .filter((notification) => notification.userId === userId)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        : [],
    [notifications, userId],
  );
}

export function useProfile(userId: string | undefined): SeekerProfile | undefined {
  const profiles = useMockState().profiles;
  return useMemo(
    () => (userId ? profiles.find((profile) => profile.userId === userId) : undefined),
    [profiles, userId],
  );
}

export function useCompanies(): CompanyView[] {
  return useMockState().companies ?? [];
}

export function useEmployerRequests(): EmployerRequestView[] {
  return useMockState().employerRequests ?? [];
}

export function useAdminUsers(): AdminUserView[] {
  return useMockState().adminUsers ?? [];
}

export function useShortlistedCandidates(): ShortlistView[] {
  return useMockState().shortlistedCandidates ?? [];
}

export function useDocuments(): DocumentView[] {
  return useMockState().documents ?? [];
}
