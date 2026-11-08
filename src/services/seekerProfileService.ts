export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ProfileCv {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface ProfilePhoto {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface SeekerProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
  skills: string[];
  qualifications: string[];
  experience: WorkExperience[];
  cv: ProfileCv | null;
  photo: ProfilePhoto | null;
}

export const EMPTY_SEEKER_PROFILE: SeekerProfile = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  headline: '',
  summary: '',
  skills: [],
  qualifications: [],
  experience: [],
  cv: null,
  photo: null,
};

export function getSeekerProfileKey(userId: string) {
  return `seeker:${encodeURIComponent(userId)}:profile`;
}

export function loadSeekerProfile(userId: string): SeekerProfile {
  const stored = window.localStorage.getItem(getSeekerProfileKey(userId));
  if (!stored) {
    return { ...EMPTY_SEEKER_PROFILE };
  }

  const profile: unknown = JSON.parse(stored);
  if (!profile || typeof profile !== 'object') {
    throw new Error('Saved profile data is invalid.');
  }

  return { ...EMPTY_SEEKER_PROFILE, ...(profile as Partial<SeekerProfile>) };
}

export function saveSeekerProfile(userId: string, profile: SeekerProfile) {
  window.localStorage.setItem(getSeekerProfileKey(userId), JSON.stringify(profile));
}

export function isSeekerProfileComplete(profile: SeekerProfile) {
  return Boolean(profile.fullName.trim() && profile.email.trim());
}