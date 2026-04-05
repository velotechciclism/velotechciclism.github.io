import React, { createContext, ReactNode } from 'react';
import { useAuth, AuthUser } from '../hooks/useAuth';

interface AuthContextType {
  user: AuthUser | null;
  profile: AuthUser | null;
  session: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (email: string, name: string, password: string, phone?: string, address?: string) => Promise<{ user: AuthUser; token: string }>;
  login: (email: string, password: string) => Promise<{ user: AuthUser; token: string }>;
  logout: () => Promise<void>;
  loadProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext deve ser usado dentro de AuthProvider');
  }
  return context;
}
