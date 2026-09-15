import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { authApi } from '../api/authApi';
import { storage } from '../services/storage';
import { setUnauthorizedListener } from '../api/client';
import { restoreValidatedSession } from '../services/session';

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
      const session = await restoreValidatedSession();
      setToken(session?.token ?? null);
      setUser(session?.user ?? null);
    } catch (error: any) {
      setSessionError(error.message || 'Unable to verify your session. Please try again.');
    } finally {
      setIsRestoringSession(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
        await storage.saveToken(jwtToken);
        await storage.saveUser(userData);
        // The session is real and persisted. Let the login screen finish its bounded
        // celebration before the existing authenticated navigator replaces it.
        if (onAuthenticated) {
          let timer: ReturnType<typeof setTimeout> | undefined;
          try {
            await Promise.race([onAuthenticated(), new Promise<void>(resolve => {timer = setTimeout(resolve, 2200);})]);
          } catch {
            // A decorative animation must never prevent a valid login.
          } finally {if (timer) clearTimeout(timer);}
        }
        setToken(jwtToken);
        setUser(userData);
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
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('[AuthContext] Server logout call error:', e);
    } finally {
      setToken(null);
      setUser(null);
      await storage.clearAll();
      setIsLoading(false);
    }
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
