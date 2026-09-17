import apiClient from './client';
import { ApiResponse } from '../types';

export async function learningRequest<T>(method: 'get' | 'post', url: string, body?: unknown, signal?: AbortSignal): Promise<ApiResponse<T>> {
  const response = method === 'get' ? await apiClient.get(url, {signal}) : await apiClient.post(url, body, {signal});
  if (!response.data?.success) throw new Error(response.data?.message || 'Unable to load learning data. Please retry.');
  return response.data;
}
export const entityId = (value: any): string => String(value?._id || value?.id || value || '');
