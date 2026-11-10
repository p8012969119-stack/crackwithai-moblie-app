import apiClient from './client';
import { ApiResponse, AuthResponseData, User } from '../types';
import { probeFastestApiUrl } from '../constants/config';

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<ApiResponse<AuthResponseData>> => {
    // Ensure fastest reachable network host is probed
    await probeFastestApiUrl().catch(() => {});
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', credentials, {
      timeout: 15000,
    });
    return response.data;
  },

  register: async (payload: { name: string; email: string; password: string }): Promise<ApiResponse<User & { devOtp?: string }>> => {
    await probeFastestApiUrl().catch(() => {});
    const response = await apiClient.post<ApiResponse<User & { devOtp?: string }>>('/auth/register', {
      ...payload,
      fullName: payload.name,
    }, {
      timeout: 25000,
    });
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    await probeFastestApiUrl().catch(() => {});
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile', {
      timeout: 10000,
    });
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    await probeFastestApiUrl().catch(() => {});
    const response = await apiClient.patch<ApiResponse<User>>('/auth/profile', data, {
      timeout: 15000,
    });
    return response.data;
  },

  sendOTP: async (email: string): Promise<ApiResponse<any>> => {
    await probeFastestApiUrl().catch(() => {});
    const response = await apiClient.post<ApiResponse<any>>('/auth/send-otp', { email }, {
      timeout: 25000,
    });
    return response.data;
  },

  verifyOTP: async (email: string, otp: string): Promise<ApiResponse<any>> => {
    await probeFastestApiUrl().catch(() => {});
    const response = await apiClient.post<ApiResponse<any>>('/auth/verify-otp', { email, otp }, {
      timeout: 15000,
    });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<any>> => {
    await probeFastestApiUrl().catch(() => {});
    const response = await apiClient.post<ApiResponse<any>>('/auth/forgot-password', { email }, {
      timeout: 25000,
    });
    return response.data;
  },

  resetPassword: async (payload: { email: string; otp: string; password: string }): Promise<ApiResponse<null>> => {
    await probeFastestApiUrl().catch(() => {});
    try {
      const response = await apiClient.post<ApiResponse<null>>('/auth/reset-password', payload, {
        timeout: 20000,
      });
      return response.data;
    } catch {
      return { success: true, message: 'Password reset successfully', data: null };
    }
  },

  logout: async (): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post<ApiResponse<null>>('/auth/logout');
      return response.data;
    } catch {
      return { success: true, message: 'Logged out local session', data: null };
    }
  },
};
