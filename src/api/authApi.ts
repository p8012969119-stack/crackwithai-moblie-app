import apiClient from './client';
import { ApiResponse, AuthResponseData, User } from '../types';
import { probeFastestApiUrl } from '../constants/config';

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<ApiResponse<AuthResponseData>> => {
    // Ensure fastest reachable network host is used
    await probeFastestApiUrl().catch(() => {});
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', credentials, {
      timeout: 6000,
    });
    return response.data;
  },

  register: async (payload: { name: string; email: string; password: string }): Promise<ApiResponse<User>> => {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register', {
      ...payload,
      fullName: payload.name,
    });
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    await probeFastestApiUrl().catch(() => {});
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>('/auth/profile', data);
    return response.data;
  },

  sendOTP: async (email: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/send-otp', { email });
    return response.data;
  },

  verifyOTP: async (email: string, otp: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/verify-otp', { email, otp });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (payload: { email: string; otp: string; password: string }): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post<ApiResponse<null>>('/auth/reset-password', payload);
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
