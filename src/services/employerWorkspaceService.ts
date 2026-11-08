export interface EmployerVacancy {
  id: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
  deadline?: string;
}

export interface EmployerApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail?: string;
  appliedDate: string;
  status: string;
}

export interface EmployerNotification {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
}

export interface EmployerWorkspaceData {
  vacancies: EmployerVacancy[];
  applications: EmployerApplication[];
  notifications: EmployerNotification[];
}

export function getEmployerWorkspaceKeys(userId: string) {
  const namespace = `employer:${encodeURIComponent(userId)}`;

  return {
    vacancies: `${namespace}:vacancies`,
    applications: `${namespace}:applications`,
    notifications: `${namespace}:notifications`,
  };
}

function readArray<T>(key: string): T[] {
  const stored = window.localStorage.getItem(key);
  if (!stored) {
    return [];
  }

  const value: unknown = JSON.parse(stored);
  if (!Array.isArray(value)) {
    throw new Error(`Invalid employer workspace data for ${key}`);
  }

  return value as T[];
}

export function loadEmployerWorkspace(userId: string): EmployerWorkspaceData {
  const keys = getEmployerWorkspaceKeys(userId);

  return {
    vacancies: readArray<EmployerVacancy>(keys.vacancies),
    applications: readArray<EmployerApplication>(keys.applications),
    notifications: readArray<EmployerNotification>(keys.notifications),
  };
}