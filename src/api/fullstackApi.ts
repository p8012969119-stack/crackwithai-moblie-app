import apiClient from './client';
import { storage } from '../services/storage';
import {
  FullStackTrack,
  HtmlCourse,
  HtmlLesson,
  FullStackProgress
} from '../types/fullstack';
import {
  FULLSTACK_TRACKS,
  FALLBACK_HTML_COURSE,
  getFallbackLessonById
} from '../data/fullstackHtmlData';

const PROGRESS_KEY = 'fullstack_html_completed_lessons';
const CODE_PREFIX = 'fullstack_html_code_';

export const fullstackApi = {
  async getTracks(): Promise<FullStackTrack[]> {
    try {
      const res = await apiClient.get('/fullstack/tracks');
      const list = res.data?.data?.tracks || (Array.isArray(res.data?.data) ? res.data?.data : null);
      if (res.data?.success && Array.isArray(list)) {
        return list;
      }
    } catch (err) {
      // Fallback if offline
    }
    return FULLSTACK_TRACKS;
  },

  async getHtmlCourse(): Promise<HtmlCourse> {
    try {
      const res = await apiClient.get('/fullstack/html/course');
      if (res.data?.success && res.data?.data) {
        const payload = res.data.data;
        if (payload.course) {
          return {
            ...payload.course,
            modules: payload.modules || payload.course.modules || []
          };
        }
      }
    } catch (err) {
      // Fallback if offline
    }
    return FALLBACK_HTML_COURSE;
  },

  async getLesson(lessonId: string): Promise<HtmlLesson | null> {
    try {
      const res = await apiClient.get(`/fullstack/html/lessons/${lessonId}`);
      const lesson = res.data?.data?.lesson || (res.data?.data?.title ? res.data?.data : null);
      if (res.data?.success && lesson) {
        return lesson;
      }
    } catch (err) {
      // Fallback if offline
    }
    return getFallbackLessonById(lessonId) || null;
  },

  async getProgress(): Promise<FullStackProgress> {
    let localCompleted: string[] = [];
    try {
      const stored = await storage.getItem(PROGRESS_KEY);
      if (stored) {
        localCompleted = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    try {
      const res = await apiClient.get('/fullstack/html/progress');
      if (res.data?.success && res.data?.data?.progress) {
        const backendProgress = res.data.data.progress;
        const mergedSet = new Set<string>([
          ...localCompleted,
          ...(backendProgress.completedLessons || [])
        ]);
        const mergedList = Array.from(mergedSet);
        await storage.setItem(PROGRESS_KEY, JSON.stringify(mergedList));
        return {
          courseId: backendProgress.courseId || 'html-from-beginner-to-practical',
          completedLessonIds: mergedList,
          totalLessons: backendProgress.totalLessons || 25,
          completedCount: mergedList.length,
          percentage: Math.min(100, Math.round((mergedList.length / (backendProgress.totalLessons || 25)) * 100)),
          lastLessonId: backendProgress.lastLessonId
        };
      }
    } catch {
      // Fallback
    }

    return {
      courseId: 'html-from-beginner-to-practical',
      completedLessonIds: localCompleted,
      totalLessons: 25,
      completedCount: localCompleted.length,
      percentage: Math.min(100, Math.round((localCompleted.length / 25) * 100))
    };
  },

  async completeLesson(lessonId: string, courseId?: string): Promise<{ success: boolean; completedLessonIds: string[]; percentage: number }> {
    let localCompleted: string[] = [];
    try {
      const stored = await storage.getItem(PROGRESS_KEY);
      if (stored) {
        localCompleted = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    if (!localCompleted.includes(lessonId)) {
      localCompleted.push(lessonId);
      await storage.setItem(PROGRESS_KEY, JSON.stringify(localCompleted));
    }

    try {
      const res = await apiClient.post('/fullstack/html/progress/complete-lesson', {
        lessonId,
        courseId
      });
      if (res.data?.success) {
        return {
          success: true,
          completedLessonIds: res.data.data.completedLessons || localCompleted,
          percentage: res.data.data.progressPercentage || Math.round((localCompleted.length / 25) * 100)
        };
      }
    } catch {
      // Fallback with local persistence
    }

    return {
      success: true,
      completedLessonIds: localCompleted,
      percentage: Math.min(100, Math.round((localCompleted.length / 25) * 100))
    };
  },

  async saveCode(lessonId: string, code: string, title?: string): Promise<boolean> {
    const key = `${CODE_PREFIX}${lessonId || 'general'}`;
    await storage.setItem(key, code);

    try {
      await apiClient.post('/fullstack/html/save-code', {
        lessonId,
        code,
        title: title || 'HTML Practice Code'
      });
      return true;
    } catch {
      // Saved locally
      return true;
    }
  },

  async getSavedCode(lessonId: string): Promise<string | null> {
    try {
      const res = await apiClient.get(`/fullstack/html/saved-code/${lessonId || 'general'}`);
      if (res.data?.success && typeof res.data?.data?.code === 'string') {
        return res.data.data.code;
      }
    } catch {
      // Try local storage
    }

    const key = `${CODE_PREFIX}${lessonId || 'general'}`;
    return await storage.getItem(key);
  }
};
