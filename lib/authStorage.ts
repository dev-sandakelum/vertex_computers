export interface StoredAuthProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  rememberMe: boolean;
  acceptedTerms: boolean;
  createdAt: string;
}

export interface PublicAuthUser {
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
  email: string;
  phone: string;
  rememberMe: boolean;
  acceptedTerms: boolean;
  createdAt: string;
}

const PROFILE_KEY = 'vertex_auth_profile';
const SESSION_KEY = 'vertex_auth_session';

const DEMO_PROFILE: StoredAuthProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'name@example.com',
  phone: '+1 (555) 000-0000',
  password: 'Demo1234!',
  rememberMe: true,
  acceptedTerms: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export function getDemoAuthProfile(): StoredAuthProfile {
  return { ...DEMO_PROFILE };
}

export function loadAuthProfile(): StoredAuthProfile {
  if (typeof window === 'undefined') return getDemoAuthProfile();

  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return getDemoAuthProfile();
    const parsed = normalizeProfile(JSON.parse(raw));
    return parsed ?? getDemoAuthProfile();
  } catch {
    return getDemoAuthProfile();
  }
}

export function saveAuthProfile(profile: StoredAuthProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadAuthSession(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const email = localStorage.getItem(SESSION_KEY);
    return email && email.trim().length > 0 ? email : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, email);
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function toPublicAuthUser(profile: StoredAuthProfile): PublicAuthUser {
  const initials = `${profile.firstName.slice(0, 1)}${profile.lastName.slice(0, 1)}`.trim().toUpperCase();

  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    fullName: `${profile.firstName} ${profile.lastName}`.trim(),
    initials: initials || 'U',
    email: profile.email,
    phone: profile.phone,
    rememberMe: profile.rememberMe,
    acceptedTerms: profile.acceptedTerms,
    createdAt: profile.createdAt,
  };
}

function normalizeProfile(raw: unknown): StoredAuthProfile | null {
  if (!raw || typeof raw !== 'object') return null;

  const candidate = raw as Partial<StoredAuthProfile>;
  const firstName = typeof candidate.firstName === 'string' ? candidate.firstName.trim() : '';
  const lastName = typeof candidate.lastName === 'string' ? candidate.lastName.trim() : '';
  const email = typeof candidate.email === 'string' ? candidate.email.trim() : '';
  const phone = typeof candidate.phone === 'string' ? candidate.phone.trim() : '';
  const password = typeof candidate.password === 'string' ? candidate.password : '';
  const createdAt = typeof candidate.createdAt === 'string' ? candidate.createdAt : '';

  if (!firstName || !lastName || !email || !phone || !password || !createdAt) {
    return null;
  }

  return {
    firstName,
    lastName,
    email,
    phone,
    password,
    rememberMe: Boolean(candidate.rememberMe),
    acceptedTerms: Boolean(candidate.acceptedTerms),
    createdAt,
  };
}