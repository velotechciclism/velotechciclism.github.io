import { getApiUrl, getBackendUnavailableMessage } from './api';

const API_URL = getApiUrl();

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
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(getBackendUnavailableMessage());
    }
    throw error;
  }
}

export async function getProfile(token: string): Promise<User> {
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
