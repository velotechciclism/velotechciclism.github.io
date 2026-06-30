import { getApiUrl, getBackendUnavailableMessage, isLocalhost, shouldUseRemoteApi } from './api';
import {
  getLocalProfile,
  isLocalAuthToken,
  loginLocalUser,
  registerLocalUser,
} from './localAuth';

const API_URL = getApiUrl();

class BackendUnavailableError extends Error {
  constructor(message = getBackendUnavailableMessage()) {
    super(message);
    this.name = 'BackendUnavailableError';
  }
}

function isBackendUnavailableError(error: unknown): boolean {
  return error instanceof BackendUnavailableError || error instanceof TypeError;
}

function canUseLocalAuthFallback(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const envFlag = String(import.meta.env.VITE_ENABLE_LOCAL_AUTH_FALLBACK || '')
    .trim()
    .toLowerCase();
  const envApiUrl = String(import.meta.env.VITE_API_URL || '').trim();

  if (envFlag === 'true') {
    return true;
  }

  if (envFlag === 'false') {
    return false;
  }

  if (!isLocalhost(window.location.hostname) && !envApiUrl) {
    return true;
  }

  return isLocalhost(window.location.hostname);
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

    if (!text.trim() || text.trim().startsWith('<')) {
      throw new BackendUnavailableError();
    }

    return text || fallbackMessage;
  } catch (error) {
    if (error instanceof BackendUnavailableError) {
      throw error;
    }

    return fallbackMessage;
  }
}

async function readJsonOrThrow<T>(response: Response, fallbackMessage: string): Promise<T> {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new BackendUnavailableError();
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new BackendUnavailableError(
      fallbackMessage || getBackendUnavailableMessage()
    );
  }
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role?: 'customer' | 'admin';
  status?: 'active' | 'blocked';
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
  if (!shouldUseRemoteApi()) {
    return registerLocalUser(email, name, password, phone, address);
  }

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
    if (isBackendUnavailableError(error) && canUseLocalAuthFallback()) {
      return registerLocalUser(email, name, password, phone, address);
    }

    if (error instanceof TypeError) {
      throw new Error(getBackendUnavailableMessage());
    }

    throw error;
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  if (!shouldUseRemoteApi()) {
    return loginLocalUser(email, password);
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'Erro ao acessar conta'));
    }

    return readJsonOrThrow<AuthResponse>(response, 'Erro ao acessar conta');
  } catch (error) {
    if (isBackendUnavailableError(error) && canUseLocalAuthFallback()) {
      return loginLocalUser(email, password);
    }

    if (error instanceof TypeError) {
      throw new Error(getBackendUnavailableMessage());
    }

    throw error;
  }
}

export async function getProfile(token: string): Promise<User> {
  if (isLocalAuthToken(token)) {
    const localUser = getLocalProfile(token);

    if (!localUser) {
      throw new Error('Sessao local expirada');
    }

    return localUser;
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
    if (error instanceof TypeError) {
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

export { isLocalAuthToken };
