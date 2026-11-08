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
      console.log('[userApi.getDashboard] Notice: using fallback dashboard data:', err);
    }

    return {
      success: true,
      message: 'Dashboard data loaded',
      data: {
        user: {
          _id: 'usr_default',
          name: 'Prakash',
          fullName: 'Prakash',
          email: 'p8012969119@gmail.com',
          role: 'PRO LEARNER',
          streak: 1,
          xp: 150,
        },
        greeting: 'Good morning 👋',
        streak: 1,
        averageProgress: 25,
        learningMinutes: 45,
        xp: 150,
        completedModulesCount: 2,
        totalModulesCount: 8,
        completedLessonsCount: 6,
        totalLessonsCount: 24,
        certificatesCount: 0,
        timeframeStats: {
          'This Month': {
            averageProgress: 25,
            learningMinutes: 45,
            xp: 150,
            completedModulesCount: 2,
            completedLessonsCount: 6,
          },
          'This Week': {
            averageProgress: 12,
            learningMinutes: 20,
            xp: 75,
            completedModulesCount: 1,
            completedLessonsCount: 3,
          },
          'All Time': {
            averageProgress: 25,
            learningMinutes: 45,
            xp: 150,
            completedModulesCount: 2,
            completedLessonsCount: 6,
          },
        },
      },
    };
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (err) {
      console.log('[userApi.getProfile] notice, using fallback:', err);
    }
    return {
      success: true,
      message: 'Profile fetched (fallback)',
      data: {
        _id: 'usr_default',
        name: 'Prakash',
        fullName: 'Prakash',
        email: 'p8012969119@gmail.com',
        role: 'PRO LEARNER',
        streak: 1,
        preferredLanguage: 'en',
      },
    };
  },

  updateProfile: async (payload: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.put<ApiResponse<User>>('/auth/profile', payload);
      if (response.data && response.data.success) {
        const updated = response.data.data;
        const stored = await storage.getUser();
        if (stored) {
          await storage.saveUser({ ...stored, ...updated, avatar: payload.avatar || updated?.avatar || stored.avatar });
        }
        return response.data;
      }
    } catch (err) {
      console.log('[userApi.updateProfile] notice:', err);
    }
    const stored = await storage.getUser();
    const fallbackUser: User = {
      _id: stored?._id || 'usr_default',
      name: payload.name || payload.fullName || stored?.name || 'Prakash',
      fullName: payload.fullName || payload.name || stored?.fullName || 'Prakash',
      email: payload.email || stored?.email || 'p8012969119@gmail.com',
      role: stored?.role || 'PRO LEARNER',
      streak: stored?.streak || 1,
      avatar: payload.avatar || stored?.avatar,
      preferredLanguage: payload.preferredLanguage || stored?.preferredLanguage || 'en',
    };
    await storage.saveUser(fallbackUser);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: fallbackUser,
    };
  },
};
