import type { AuthResponse, User } from './auth';
import { persistBrowserDatabase, queryOne, runStatement } from './browserDatabase';

const AUTH_TOKEN_KEY = 'authToken';
const LOCAL_TOKEN_PREFIX = 'local-auth:';
const PBKDF2_PREFIX = 'pbkdf2-sha256';
const PBKDF2_ITERATIONS = 310000;
const LOCAL_ADMIN_EMAILS = ['nunesnbnxn@gmail.com', 'c.eduardoteixeiraguinsber@gmail.com'];
const DEFAULT_LOCAL_ADMIN_CREDENTIALS: Record<string, { name: string; password: string }> = {
  'c.eduardoteixeiraguinsber@gmail.com': {
    name: 'Eduardo Guinsber',
    password: 'Cg123456#*',
  },
};

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

type LocalUserRow = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  role: 'customer' | 'admin';
  status: 'active' | 'blocked';
  password_hash: string;
  created_at: string;
};

function rowToUser(row: LocalUserRow): LocalUserRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone || undefined,
    address: row.address || undefined,
    role: row.role,
    status: row.status,
    passwordHash: row.password_hash,
    created_at: row.created_at,
  };
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

function getDefaultAdminCredential(email: string, password: string) {
  const credential = DEFAULT_LOCAL_ADMIN_CREDENTIALS[normalizeEmail(email)];

  if (!credential || credential.password !== password) {
    return null;
  }

  return credential;
}

async function createDefaultAdminUser(email: string, password: string, name: string): Promise<LocalUserRecord> {
  const normalizedEmail = normalizeEmail(email);
  const createdAt = new Date().toISOString();
  runStatement(
    `INSERT INTO local_users(email, name, role, status, password_hash, created_at)
     VALUES (?, ?, 'admin', 'active', ?, ?)`,
    [normalizedEmail, name, await hashPassword(normalizedEmail, password), createdAt]
  );
  await persistBrowserDatabase();

  const inserted = queryOne<LocalUserRow>('SELECT * FROM local_users WHERE email = ? COLLATE NOCASE', [normalizedEmail]);
  if (!inserted) {
    throw new Error('Nao foi possivel criar a conta administradora local.');
  }

  return rowToUser(inserted);
}

async function activateDefaultAdminCredential(record: LocalUserRecord, password: string): Promise<LocalUserRecord> {
  const passwordHash = await hashPassword(record.email, password);
  runStatement(
    "UPDATE local_users SET role = 'admin', status = 'active', password_hash = ? WHERE id = ?",
    [passwordHash, record.id]
  );
  await persistBrowserDatabase();

  return {
    ...record,
    role: 'admin',
    status: 'active',
    passwordHash,
  };
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

  const row = queryOne<LocalUserRow>('SELECT * FROM local_users WHERE id = ?', [userId]);
  const record = row ? rowToUser(row) : null;
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
  if (queryOne('SELECT id FROM local_users WHERE email = ? COLLATE NOCASE', [normalizedEmail])) {
    throw new Error('E-mail ja cadastrado');
  }

  const createdAt = new Date().toISOString();
  const passwordHash = await hashPassword(normalizedEmail, password);
  const role = LOCAL_ADMIN_EMAILS.includes(normalizedEmail) ? 'admin' : 'customer';
  runStatement(
    `INSERT INTO local_users(email, name, phone, address, role, status, password_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [normalizedEmail, name.trim(), phone || null, address || null, role, 'active', passwordHash, createdAt]
  );
  const inserted = queryOne<LocalUserRow>('SELECT * FROM local_users WHERE email = ?', [normalizedEmail]);
  if (!inserted) throw new Error('Nao foi possivel criar a conta local.');
  await persistBrowserDatabase();

  const user: User = {
    id: inserted.id,
    email: normalizedEmail,
    name: name.trim(),
    phone,
    address,
    role,
    status: 'active',
    created_at: createdAt,
  };

  return {
    user,
    token: createLocalToken(user.id),
  };
}

export async function loginLocalUser(email: string, password: string): Promise<AuthResponse> {
  const normalizedEmail = normalizeEmail(email);
  const row = queryOne<LocalUserRow>('SELECT * FROM local_users WHERE email = ? COLLATE NOCASE', [normalizedEmail]);
  let record = row ? rowToUser(row) : undefined;
  const defaultAdminCredential = getDefaultAdminCredential(normalizedEmail, password);

  if (!record && defaultAdminCredential) {
    record = await createDefaultAdminUser(normalizedEmail, password, defaultAdminCredential.name);
  }

  const { matches, needsUpgrade } = record
    ? await verifyPassword(normalizedEmail, password, record.passwordHash)
    : { matches: false, needsUpgrade: false };

  if (!record || !matches) {
    if (record && defaultAdminCredential) {
      record = await activateDefaultAdminCredential(record, password);
    } else {
      throw new Error('E-mail ou senha invalidos');
    }
  }

  if (!record) {
    throw new Error('E-mail ou senha invalidos');
  }

  if (record.status === 'blocked') {
    throw new Error('Esta conta esta bloqueada pelo administrador.');
  }

  if (needsUpgrade) {
    runStatement('UPDATE local_users SET password_hash = ? WHERE id = ?', [
      await hashPassword(normalizedEmail, password),
      record.id,
    ]);
    await persistBrowserDatabase();
  }

  const user = stripPassword(record);

  return {
    user,
    token: createLocalToken(user.id),
  };
}
