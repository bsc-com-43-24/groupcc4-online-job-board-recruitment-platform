'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { mockStore } from '@/mock/store';
import { seedState } from '@/mock/seed';
import type {
  Application,
  Job,
  MockState,
  NotificationItem,
  SeekerProfile,
} from '@/mock/types';

/**
 * Subscribes to the mock store.
 *
 * The server snapshot is the seed state so the server-rendered HTML and the
 * first client render agree; React then re-renders with any persisted demo
 * data as soon as hydration finishes.
 */
export function useMockState(): MockState {
  return useSyncExternalStore(mockStore.subscribe, mockStore.get, () => seedState);
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
