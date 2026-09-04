'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../lib/api/auth';
import { LoginPayload, RegisterPayload, Role, User } from '../types';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleAuthSuccess = (userData: User, tokens: { accessToken: string; refreshToken: string }) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setUser(userData);
  };

  const refreshProfile = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      if (response && response.data) {
        setUser(response.data);
        localStorage.setItem('currentUser', JSON.stringify(response.data));
      }
    } catch {
      // Handled by axios interceptor
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const cachedUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;

      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          // ignore corrupted JSON
        }
      }

      if (token) {
        try {
          const response = await authApi.getMe();
          if (response && response.data) {
            setUser(response.data);
            localStorage.setItem('currentUser', JSON.stringify(response.data));
          }
        } catch {
          // If token invalid, remove
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('currentUser');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(payload);
      const { user: userData, tokens } = response.data;
      handleAuthSuccess(userData, tokens);

      // Redirect to role-based dashboard
      if (userData.role === 'STUDENT') {
        router.push('/student/dashboard');
      } else if (userData.role === 'FACULTY') {
        router.push('/faculty/dashboard');
      } else if (userData.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(payload);
      const { user: userData, tokens } = response.data;
      handleAuthSuccess(userData, tokens);

      if (userData.role === 'STUDENT') {
        router.push('/student/dashboard');
      } else if (userData.role === 'FACULTY') {
        router.push('/faculty/dashboard');
      } else {
        router.push('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshProfile,
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
