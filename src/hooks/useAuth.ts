import { useCallback, useEffect, useState } from 'react';
import { getAuthToken, getProfile, loginUser, registerUser, setAuthToken, clearAuthToken } from '@/lib/auth';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<string | null>(null);
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await getProfile(token);
      setSession(token);
      setUser(currentUser);
      setProfile(currentUser);
    } catch {
      clearAuthToken();
      setSession(null);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const register = async (
    email: string,
    name: string,
    password: string,
    phone?: string,
    address?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await registerUser(email, name, password, phone, address);
      setAuthToken(response.token);
      setSession(response.token);
      setUser(response.user);
      setProfile(response.user);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginUser(email, password);
      setAuthToken(response.token);
      setSession(response.token);
      setUser(response.user);
      setProfile(response.user);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao acessar conta';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    clearAuthToken();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  return {
    user,
    profile,
    session,
    isLoading,
    error,
    isAuthenticated: Boolean(session),
    register,
    login,
    logout,
    loadProfile,
  };
}
