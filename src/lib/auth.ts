import { getApiUrl, getBackendUnavailableMessage } from './api';

const API_URL = getApiUrl();

const LOCAL_USERS_KEY = 'velotech:local:users';

type LocalUserRecord = {
  id: number;
  email: string;
  name: string;
  password: string;
  phone?: string;
  address?: string;
  created_at: string;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isLocalhostHost(): boolean {
  if (!isBrowser()) {
    return false;
  }

  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function shouldUseLocalFallback(error: unknown): boolean {
  if (!(error instanceof TypeError)) {
    return false;
  }

  return !isLocalhostHost();
}

function readLocalUsers(): LocalUserRecord[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? (JSON.parse(raw) as LocalUserRecord[]) : [];
  } catch {
    return [];
  }
}

function writeLocalUsers(users: LocalUserRecord[]) {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function toAuthUser(user: LocalUserRecord): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    address: user.address,
    created_at: user.created_at,
  };
}

function createLocalToken(userId: number): string {
  return `local-${userId}`;
}

function parseLocalToken(token: string): number | null {
  if (!token.startsWith('local-')) {
    return null;
  }

  const userId = Number(token.replace('local-', ''));
  return Number.isFinite(userId) ? userId : null;
}

async function readErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      const payload = (await response.json()) as { error?: string; message?: string };
      return payload.error || payload.message || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  }

  try {
    const text = await response.text();

    if (text.trim().startsWith('<')) {
      return 'Resposta invalida da API. Verifique se VITE_API_URL aponta para o backend correto.';
    }

    return text || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function readJsonOrThrow<T>(response: Response, fallbackMessage: string): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error('Resposta invalida da API. Verifique se o backend esta ativo e respondendo JSON.');
  }
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export async function registerUser(
  email: string,
  name: string,
  password: string,
  phone?: string,
  address?: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password, phone, address }),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'Erro ao registrar'));
    }

    return readJsonOrThrow<AuthResponse>(response, 'Erro ao registrar');
  } catch (error) {
    if (shouldUseLocalFallback(error) || (!isLocalhostHost() && error instanceof Error && error.message.includes('Resposta invalida da API'))) {
      const users = readLocalUsers();
      const exists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());

      if (exists) {
        throw new Error('Email ja cadastrado');
      }

      const nextId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      const localUser: LocalUserRecord = {
        id: nextId,
        email,
        name,
        password,
        phone,
        address,
        created_at: new Date().toISOString(),
      };

      users.push(localUser);
      writeLocalUsers(users);

      return {
        user: toAuthUser(localUser),
        token: createLocalToken(localUser.id),
      };
    }

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(getBackendUnavailableMessage());
    }
    throw error;
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'Erro ao fazer login'));
    }

    return readJsonOrThrow<AuthResponse>(response, 'Erro ao fazer login');
  } catch (error) {
    if (shouldUseLocalFallback(error) || (!isLocalhostHost() && error instanceof Error && error.message.includes('Resposta invalida da API'))) {
      const users = readLocalUsers();
      const localUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase());

      if (!localUser || localUser.password !== password) {
        throw new Error('Email ou senha invalidos');
      }

      return {
        user: toAuthUser(localUser),
        token: createLocalToken(localUser.id),
      };
    }

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(getBackendUnavailableMessage());
    }
    throw error;
  }
}

export async function getProfile(token: string): Promise<User> {
  const localUserId = parseLocalToken(token);

  if (localUserId && !isLocalhostHost()) {
    const users = readLocalUsers();
    const localUser = users.find((user) => user.id === localUserId);

    if (!localUser) {
      throw new Error('Erro ao buscar perfil');
    }

    return toAuthUser(localUser);
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'Erro ao buscar perfil'));
    }

    return readJsonOrThrow<User>(response, 'Erro ao buscar perfil');
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(getBackendUnavailableMessage());
    }
    throw error;
  }
}

export function setAuthToken(token: string) {
  localStorage.setItem('authToken', token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

export function clearAuthToken() {
  localStorage.removeItem('authToken');
}
