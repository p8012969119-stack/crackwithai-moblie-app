import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { authApi } from '../api/authApi';
import { storage } from '../services/storage';
import { setUnauthorizedListener } from '../api/client';
import { restoreValidatedSession } from '../services/session';
import { probeFastestApiUrl } from '../constants/config';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isRestoringSession: boolean;
  sessionError: string | null;
  retrySession: () => Promise<void>;
  isAuthenticated: boolean;
  login: (email: string, pass: string, onAuthenticated?: () => Promise<void>) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const restoreSession = async () => {
    try {
      setIsRestoringSession(true);
      setSessionError(null);

      // Fast-path: immediately restore cached session so reloading is instantaneous
      const [cachedUser, cachedToken] = await Promise.all([
        storage.getUser(),
        storage.getToken(),
      ]);

      if (cachedToken && cachedUser) {
        setToken(cachedToken);
        setUser(cachedUser);
        setIsRestoringSession(false);
        setIsLoading(false);
      }

      // Validate session with server in background
      const session = await restoreValidatedSession();
      if (session) {
        setToken(session.token);
        setUser(session.user);
      } else if (!cachedToken) {
        setToken(null);
        setUser(null);
      }
    } catch (error: any) {
      const cachedUser = await storage.getUser();
      const cachedToken = await storage.getToken();
      if (cachedUser && cachedToken) {
        setToken(cachedToken);
        setUser(cachedUser);
      } else {
        setSessionError(error.message || 'Unable to verify your session. Please try again.');
      }
    } finally {
      setIsRestoringSession(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    probeFastestApiUrl().catch(() => {});
    setUnauthorizedListener(() => {
      setToken(null);
      setUser(null);
      setSessionError(null);
    });
    restoreSession();
    return () => {
      setUnauthorizedListener(null);
    };
  }, []);

  const login = async (email: string, pass: string, onAuthenticated?: () => Promise<void>) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password: pass });
      if (response.success && response.data) {
        const { token: jwtToken, user: userData } = response.data;
        if (!jwtToken || !userData?._id) throw new Error('Login did not return a valid session. Please try again.');
        // Persist token and user profile in parallel for minimum latency
        await Promise.all([
          storage.saveToken(jwtToken),
          storage.saveUser(userData),
        ]);
        // Update auth state immediately for instant navigation to dashboard
        setToken(jwtToken);
        setUser(userData);
        // Run any decorative completion asynchronously without blocking the user
        if (onAuthenticated) {
          void onAuthenticated().catch(() => {});
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({ name, email, password: pass });
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }
      // After registration, auto-login
      await login(email, pass);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    // Instant client-side state and storage purge for immediate navigation
    setToken(null);
    setUser(null);
    setSessionError(null);
    try {
      await storage.clearAll();
    } catch (_) {}
    setIsLoading(false);

    // Asynchronously notify server fire-and-forget without blocking user
    void authApi.logout().catch((e) => {
      console.warn('[AuthContext] Background logout notice:', e);
    });
  };

  const refreshProfile = async () => {
    try {
      const res = await authApi.getProfile();
      if (res.success && res.data) {
        setUser(res.data);
        await storage.saveUser(res.data);
      }
    } catch (err) {
      console.warn('[AuthContext] Refresh profile failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isRestoringSession,
        sessionError,
        retrySession: restoreSession,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
