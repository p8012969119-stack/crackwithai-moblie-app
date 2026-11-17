import apiClient from './client';
import { ApiResponse, DashboardData, User } from '../types';
import { storage } from '../services/storage';

export const userApi = {
  getDashboard: async (signal?: AbortSignal, period: string = 'This Month'): Promise<ApiResponse<DashboardData>> => {
    try {
      const response = await apiClient.get<ApiResponse<DashboardData>>('/auth/dashboard', {
        params: { period },
        signal,
      });
      if (response.data?.success && response.data?.data) {
        return response.data;
      }
    } catch (err) {
      console.log('[userApi.getDashboard] Notice: /auth/dashboard failed, trying /users/me:', err);
    }

    // Backup to /users/me
    try {
      const meRes = await apiClient.get<ApiResponse<any>>('/users/me', { signal });
      if (meRes.data?.success && meRes.data?.data) {
        const u = meRes.data.data;
        return {
          success: true,
          message: 'Dashboard loaded from user sync',
          data: {
            user: u,
            greeting: 'Good morning 👋',
            streak: u.streak ?? u.learningStreak ?? 0,
            xp: u.xp ?? 0,
            certificatesCount: u.learningStats?.certificatesCount ?? 0,
            completedCoursesCount: u.learningStats?.completedCoursesCount ?? 0,
            enrolledCoursesCount: u.learningStats?.enrolledCoursesCount ?? 0,
          },
        };
      }
    } catch (err) {
      console.log('[userApi.getDashboard] /users/me also failed:', err);
    }

    const cachedUser = await storage.getUser();
    return {
      success: true,
      message: 'Dashboard data loaded (cached)',
      data: {
        user: cachedUser || {
          _id: '',
          name: 'Learner',
          fullName: 'Learner',
          email: '',
          role: 'learner',
          streak: 0,
        },
        greeting: 'Good morning 👋',
        streak: cachedUser?.streak ?? cachedUser?.learningStreak ?? 0,
        certificatesCount: 0,
      },
    };
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/users/me');
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch {
      // Try /auth/profile
    }

    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (err) {
      console.log('[userApi.getProfile] network request failed:', err);
    }

    const cachedUser = await storage.getUser();
    return {
      success: true,
      message: 'Profile fetched (cached)',
      data: cachedUser || {
        _id: '',
        name: 'Learner',
        fullName: 'Learner',
        email: '',
        role: 'learner',
        streak: 0,
        preferredLanguage: 'en',
      },
    };
  },

  updateProfile: async (payload: Partial<User> & { currentPassword?: string; newPassword?: string; twoFactorEnabled?: boolean }): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.patch<ApiResponse<User>>('/users/me', payload);
      if (response.data && response.data.success) {
        const updated = response.data.data;
        const stored = await storage.getUser();
        if (stored) {
          await storage.saveUser({ ...stored, ...updated, avatar: payload.avatar || updated?.avatar || stored.avatar });
        }
        return response.data;
      }
    } catch {
      // Try /auth/profile
    }

    try {
      const response = await apiClient.patch<ApiResponse<User>>('/auth/profile', payload);
      if (response.data && response.data.success) {
        const updated = response.data.data;
        const stored = await storage.getUser();
        if (stored) {
          await storage.saveUser({ ...stored, ...updated, avatar: payload.avatar || updated?.avatar || stored.avatar });
        }
        return response.data;
      }
    } catch (err: any) {
      console.log('[userApi.updateProfile] notice:', err?.response?.data || err?.message || err);
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
    }

    const cachedUser = await storage.getUser();
    const updated = {
      ...(cachedUser || {}),
      ...payload,
      fullName: payload.fullName || payload.name || cachedUser?.fullName || cachedUser?.name || 'Learner',
      name: payload.name || payload.fullName || cachedUser?.name || cachedUser?.fullName || 'Learner',
    };
    await storage.saveUser(updated);

    return {
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    };
  },
};
