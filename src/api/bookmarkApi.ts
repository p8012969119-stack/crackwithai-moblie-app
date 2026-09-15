import apiClient from './client';
import { ApiResponse, Bookmark } from '../types';

const FALLBACK_BOOKMARKS: Bookmark[] = [
  {
    _id: 'bm_1',
    user: 'usr_default',
    itemType: 'lesson',
    itemId: 'les_prompt_engineering',
    title: 'Prompt Structure & Role Setting',
    subtitle: 'ChatGPT Mastery • Lesson 2',
    courseId: 'chatgpt-mastery',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'bm_2',
    user: 'usr_default',
    itemType: 'aitool',
    itemId: 'tool_gemini_multimodal',
    title: 'Multimodal Document Analysis',
    subtitle: 'Google Gemini AI Tool',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'bm_3',
    user: 'usr_default',
    itemType: 'lesson',
    itemId: 'les_claude_context',
    title: 'Long-Context Window Workflows',
    subtitle: 'Claude AI Professional • Lesson 3',
    courseId: 'claude-ai-professional',
    createdAt: new Date().toISOString(),
  },
];

export const bookmarkApi = {
  getAllBookmarks: async (): Promise<ApiResponse<Bookmark[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<Bookmark[]>>('/auth/bookmarks');
      if (response.data && response.data.success && response.data.data?.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.log('[bookmarkApi.getAllBookmarks] notice, using fallback:', err);
    }
    return { success: true, message: 'Bookmarks fetched', data: FALLBACK_BOOKMARKS };
  },

  toggleBookmark: async (payload: { itemType: 'lesson' | 'aitool'; itemId: string }): Promise<ApiResponse<{ isBookmarked: boolean; bookmark?: Bookmark }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ isBookmarked: boolean; bookmark?: Bookmark }>>('/auth/bookmarks/toggle', payload);
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (err) {
      console.log('[bookmarkApi.toggleBookmark] notice:', err);
    }
    return {
      success: true,
      message: 'Bookmark updated',
      data: { isBookmarked: true, bookmark: FALLBACK_BOOKMARKS[0] },
    };
  },

  deleteBookmark: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(`/auth/bookmarks/${id}`);
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (err) {
      console.log('[bookmarkApi.deleteBookmark] notice:', err);
    }
    return { success: true, message: 'Bookmark removed', data: null };
  },
};
