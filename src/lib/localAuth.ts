import type { AuthResponse, User } from './auth';

const AUTH_TOKEN_KEY = 'authToken';
const LOCAL_USERS_KEY = 'velotech:local-auth-users';
const LOCAL_TOKEN_PREFIX = 'local-auth:';
const PBKDF2_PREFIX = 'pbkdf2-sha256';
const PBKDF2_ITERATIONS = 310000;

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

function toBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function createSalt(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    return toBase64(salt.buffer);
  }

  return Math.random().toString(36).slice(2, 18);
}

async function hashLegacyPassword(email: string, password: string): Promise<string> {
  const value = `${normalizeEmail(email)}:${password}`;

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const bytes = new TextEncoder().encode(value);
    return `sha256:${toHex(await crypto.subtle.digest('SHA-256', bytes))}`;
  }

  return fallbackHash(value);
}

async function derivePasswordHash(value: string, salt: string): Promise<string> {
  const passwordBytes = new TextEncoder().encode(value);
  const saltBytes = fromBase64(salt);
  const key = await crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
    },
    key,
    256
  );

  return toBase64(derivedBits);
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
    const salt = createSalt();
    const hash = await derivePasswordHash(value, salt);
    return `${PBKDF2_PREFIX}:${PBKDF2_ITERATIONS}:${salt}:${hash}`;
  }

  return fallbackHash(value);
}

async function verifyPassword(
  email: string,
  password: string,
  storedHash: string
): Promise<{ matches: boolean; needsUpgrade: boolean }> {
  if (
    storedHash.startsWith(`${PBKDF2_PREFIX}:`) &&
    typeof crypto !== 'undefined' &&
    crypto.subtle
  ) {
    const [, iterations, salt, expectedHash] = storedHash.split(':');

    if (!iterations || !salt || !expectedHash || Number(iterations) !== PBKDF2_ITERATIONS) {
      return { matches: false, needsUpgrade: false };
    }

    const computedHash = await derivePasswordHash(`${normalizeEmail(email)}:${password}`, salt);
    return { matches: computedHash === expectedHash, needsUpgrade: false };
  }

  const legacyHash = await hashLegacyPassword(email, password);
  return {
    matches: legacyHash === storedHash,
    needsUpgrade: legacyHash === storedHash,
  };
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
    throw new Error('E-mail ja cadastrado');
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
  const recordIndex = users.findIndex((user) => normalizeEmail(user.email) === normalizedEmail);
  const record = recordIndex >= 0 ? users[recordIndex] : undefined;
  const { matches, needsUpgrade } = record
    ? await verifyPassword(normalizedEmail, password, record.passwordHash)
    : { matches: false, needsUpgrade: false };

  if (!record || !matches) {
    throw new Error('E-mail ou senha invalidos');
  }

  if (needsUpgrade) {
    const upgradedUsers = [...users];
    upgradedUsers[recordIndex] = {
      ...record,
      passwordHash: await hashPassword(normalizedEmail, password),
    };
    writeLocalUsers(upgradedUsers);
  }

  const user = stripPassword(record);

  return {
    user,
    token: createLocalToken(user.id),
  };
}
