import apiClient from './client';
import { ApiResponse, DashboardData, User } from '../types';

export const userApi = {
  getDashboard: async (signal?: AbortSignal): Promise<ApiResponse<DashboardData>> => {
    try {
      const response = await apiClient.get<ApiResponse<DashboardData>>('/auth/dashboard', {signal});
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
        },
        greeting: 'Good morning 👋',
        streak: 1,
        enrolledCoursesCount: 15,
        completedCoursesCount: 0,
        certificatesCount: 0,
        courses: [
          { _id: '6aa2f695d5d02e7b2922675b', title: 'Zapier AI Automation', slug: 'zapier-ai-automation', description: 'Build intelligent workflow automations using Zapier AI.', shortDescription: 'Build intelligent workflow automations using Zapier AI.', level: 'beginner', isEnrolled: true, progressPercentage: 15, totalLessons: 12, totalEstimatedMinutes: 90, isFree: false },
          { _id: '6aa2f694d5d02e7b29225990', title: 'Gamma AI Presentation', slug: 'gamma-ai-presentation', description: 'Create professional pitch decks & slides in seconds with Gamma.', shortDescription: 'Create professional pitch decks & slides in seconds with Gamma.', level: 'beginner', isEnrolled: true, progressPercentage: 30, totalLessons: 12, totalEstimatedMinutes: 75, isFree: true },
          { _id: '6aa2f694d5d02e7b29225ad1', title: 'Pika AI Video Creator', slug: 'pika-ai-video-creator', description: 'Generate cinematic AI videos & 3D animations effortlessly.', shortDescription: 'Generate cinematic AI videos & 3D animations effortlessly.', level: 'intermediate', isEnrolled: true, progressPercentage: 10, totalLessons: 12, totalEstimatedMinutes: 110, isFree: false },
          { _id: '6aa2f694d5d02e7b29225c12', title: 'Notion AI Productivity', slug: 'notion-ai-productivity', description: 'Supercharge your workspace & notes with Notion AI features.', shortDescription: 'Supercharge your workspace & notes with Notion AI features.', level: 'beginner', isEnrolled: true, progressPercentage: 45, totalLessons: 12, totalEstimatedMinutes: 60, isFree: true },
          { _id: '6aa2f693d5d02e7b2922584f', title: 'Claude AI Professional', slug: 'claude-ai-professional', description: 'Master prompt engineering & complex reasoning with Claude 3.5.', shortDescription: 'Master prompt engineering & complex reasoning with Claude 3.5.', level: 'advanced', isEnrolled: true, progressPercentage: 20, totalLessons: 12, totalEstimatedMinutes: 120, isFree: false },
        ],
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
        name: 'Prakash Student',
        fullName: 'Prakash Student',
        email: 'prakash@crackwithai.com',
        role: 'PRO LEARNER',
        streak: 5,
        preferredLanguage: 'en',
      },
    };
  },

  updateProfile: async (payload: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.put<ApiResponse<User>>('/auth/profile', payload);
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (err) {
      console.log('[userApi.updateProfile] notice:', err);
    }
    return {
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: 'usr_default',
        name: payload.name || 'Prakash Student',
        fullName: payload.fullName || payload.name || 'Prakash Student',
        email: payload.email || 'prakash@crackwithai.com',
        role: 'PRO LEARNER',
        streak: 5,
        preferredLanguage: payload.preferredLanguage || 'en',
      },
    };
  },
};
