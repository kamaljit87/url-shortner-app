'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, AuthUser } from '@/lib/api';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'url_shortener_token';
const USER_KEY = 'url_shortener_user';

interface Session {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
}

function readStoredSession(): Session {
  if (typeof window === 'undefined') {
    return { token: null, user: null, isLoading: true };
  }

  const storedToken = localStorage.getItem(TOKEN_KEY);
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedToken || !storedUser) {
    return { token: null, user: null, isLoading: false };
  }

  try {
    return { token: storedToken, user: JSON.parse(storedUser) as AuthUser, isLoading: false };
  } catch {
    return { token: null, user: null, isLoading: false };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(readStoredSession);
  const router = useRouter();

  function persistSession(nextToken: string, nextUser: AuthUser) {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setSession({ token: nextToken, user: nextUser, isLoading: false });
  }

  async function login(email: string, password: string) {
    const result = await authApi.login(email, password);
    persistSession(result.token, result.user);
  }

  async function register(email: string, password: string) {
    const result = await authApi.register(email, password);
    persistSession(result.token, result.user);
  }

  async function logout() {
    if (session.token) {
      await authApi.logout(session.token).catch(() => undefined);
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setSession({ token: null, user: null, isLoading: false });
    router.push('/login');
  }

  return (
    <AuthContext.Provider
      value={{
        user: session.user,
        token: session.token,
        isLoading: session.isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
