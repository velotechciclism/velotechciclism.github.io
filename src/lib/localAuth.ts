import type { AuthResponse, User } from './auth';

const AUTH_TOKEN_KEY = 'authToken';
const LOCAL_USERS_KEY = 'velotech:local-auth-users';
const LOCAL_TOKEN_PREFIX = 'local-auth:';

interface LocalUserRecord extends User {
  passwordHash: string;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readLocalUsers(): LocalUserRecord[] {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  try {
    const rawUsers = storage.getItem(LOCAL_USERS_KEY);
    return rawUsers ? (JSON.parse(rawUsers) as LocalUserRecord[]) : [];
  } catch {
    return [];
  }
}

function writeLocalUsers(users: LocalUserRecord[]) {
  const storage = getStorage();

  if (!storage) {
    throw new Error('Armazenamento local indisponivel neste navegador.');
  }

  storage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function fallbackHash(value: string): string {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `fnv1a:${(hash >>> 0).toString(16)}`;
}

async function hashPassword(email: string, password: string): Promise<string> {
  const value = `${normalizeEmail(email)}:${password}`;

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const bytes = new TextEncoder().encode(value);
    return `sha256:${toHex(await crypto.subtle.digest('SHA-256', bytes))}`;
  }

  return fallbackHash(value);
}

function createLocalToken(userId: number): string {
  const randomId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${LOCAL_TOKEN_PREFIX}${userId}:${randomId}`;
}

function stripPassword(record: LocalUserRecord): User {
  const { passwordHash: _passwordHash, ...user } = record;
  return user;
}

function getNextUserId(users: LocalUserRecord[]): number {
  return users.reduce((nextId, user) => Math.max(nextId, user.id + 1), 1);
}

export function isLocalAuthToken(token?: string | null): boolean {
  return Boolean(token?.startsWith(LOCAL_TOKEN_PREFIX));
}

export function hasLocalAuthToken(): boolean {
  return isLocalAuthToken(getStorage()?.getItem(AUTH_TOKEN_KEY));
}

export function getLocalProfile(token: string): User | null {
  if (!isLocalAuthToken(token)) {
    return null;
  }

  const userId = Number(token.slice(LOCAL_TOKEN_PREFIX.length).split(':')[0]);

  if (!Number.isFinite(userId)) {
    return null;
  }

  const record = readLocalUsers().find((user) => user.id === userId);
  return record ? stripPassword(record) : null;
}

export async function registerLocalUser(
  email: string,
  name: string,
  password: string,
  phone?: string,
  address?: string
): Promise<AuthResponse> {
  const normalizedEmail = normalizeEmail(email);
  const users = readLocalUsers();

  if (users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
    throw new Error('Email ja cadastrado');
  }

  const user: User = {
    id: getNextUserId(users),
    email: normalizedEmail,
    name: name.trim(),
    phone,
    address,
    created_at: new Date().toISOString(),
  };

  const record: LocalUserRecord = {
    ...user,
    passwordHash: await hashPassword(normalizedEmail, password),
  };

  writeLocalUsers([...users, record]);

  return {
    user,
    token: createLocalToken(user.id),
  };
}

export async function loginLocalUser(email: string, password: string): Promise<AuthResponse> {
  const normalizedEmail = normalizeEmail(email);
  const users = readLocalUsers();
  const record = users.find((user) => normalizeEmail(user.email) === normalizedEmail);
  const attemptedHash = await hashPassword(normalizedEmail, password);

  if (!record || record.passwordHash !== attemptedHash) {
    throw new Error('Email ou senha invalidos');
  }

  const user = stripPassword(record);

  return {
    user,
    token: createLocalToken(user.id),
  };
}
