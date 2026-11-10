import apiClient from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FullStackTrack, HtmlCourse, HtmlLesson, FullStackProgress} from '../types/fullstack';

const LOCAL_PROGRESS_PREFIX = '@cwa_completed_lessons_';

export const getLocalCompletedLessons = async (courseSlug: string): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(`${LOCAL_PROGRESS_PREFIX}${courseSlug.toLowerCase()}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalCompletedLesson = async (
  courseSlug: string,
  lessonId: string,
  additionalIds: string[] = []
): Promise<string[]> => {
  try {
    const key = `${LOCAL_PROGRESS_PREFIX}${courseSlug.toLowerCase()}`;
    const raw = await AsyncStorage.getItem(key);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    const allToAdd = [lessonId, ...additionalIds].filter(Boolean);
    const updated = Array.from(new Set([...existing, ...allToAdd]));
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch {
    return [lessonId, ...additionalIds].filter(Boolean);
  }
};

const unwrap = (response: any) => {
  if (!response.data?.success) throw new Error(response.data?.message || 'Unable to load HTML course.');
  return response.data.data;
};

export const fullstackApi = {
  async getTracks(): Promise<FullStackTrack[]> { return unwrap(await apiClient.get('/fullstack/tracks')).tracks; },
  async getHtmlCourse(): Promise<HtmlCourse> {
    const payload = unwrap(await apiClient.get('/fullstack/html/course'));
    return {...payload.course, modules:payload.modules || []};
  },
  async getLesson(lessonId: string, courseSlug: string = 'html'): Promise<HtmlLesson | null> {
    const slug = courseSlug || 'html';
    const payload = unwrap(await apiClient.get(`/fullstack/${slug}/lessons/${lessonId}`));
    return payload.lesson || payload;
  },
  async getProgress(courseSlug: string = 'html'): Promise<FullStackProgress> {
    const slug = (courseSlug || 'html').toLowerCase();
    const localSaved = await getLocalCompletedLessons(slug);

    try {
      const response = await apiClient.get(`/fullstack/${slug}/progress`, { timeout: 3000 });
      const progress = unwrap(response);
      const serverLessons: string[] = progress.completedLessons || [];
      const merged = Array.from(new Set([...localSaved, ...serverLessons]));
      // Sync merged set into local storage
      AsyncStorage.setItem(`${LOCAL_PROGRESS_PREFIX}${slug}`, JSON.stringify(merged)).catch(() => {});
      const totalLessons = progress.totalLessons || 0;
      const completedCount = Math.max(merged.length, progress.completedCount || 0);
      const percentage = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : (progress.progressPercentage || 0);
      return {
        courseId: progress.courseId || slug,
        completedLessonIds: merged,
        totalLessons,
        completedCount,
        percentage,
        lastLessonId: progress.currentLesson || undefined
      };
    } catch {
      // Instant resilient fallback from device storage
      return {
        courseId: slug,
        completedLessonIds: localSaved,
        totalLessons: 0,
        completedCount: localSaved.length,
        percentage: 0,
        lastLessonId: localSaved[localSaved.length - 1] || undefined
      };
    }
  },
  async completeLesson(
    lessonId: string,
    courseSlug: string = 'html',
    code?: string,
    additionalIds: string[] = []
  ): Promise<{ success: boolean; completedLessonIds: string[]; percentage: number }> {
    const slug = (courseSlug || 'html').toLowerCase();
    // 1. Instant local persistence (0ms delay)
    const localSaved = await saveLocalCompletedLesson(slug, lessonId, additionalIds);

    // 2. Concurrently push to server backend
    try {
      const response = await apiClient.post(
        `/fullstack/${slug}/progress/complete-lesson`,
        { lessonId, courseSlug: slug, code },
        { timeout: 3500 }
      );
      const progress = unwrap(response);
      const serverLessons: string[] = progress.completedLessons || [];
      const merged = Array.from(new Set([...localSaved, ...serverLessons]));
      AsyncStorage.setItem(`${LOCAL_PROGRESS_PREFIX}${slug}`, JSON.stringify(merged)).catch(() => {});
      return {
        success: true,
        completedLessonIds: merged,
        percentage: progress.progressPercentage || 0
      };
    } catch (err) {
      console.warn('[completeLesson] Local progress saved, backend sync deferred:', err);
      return {
        success: true,
        completedLessonIds: localSaved,
        percentage: 0
      };
    }
  },
  async saveCode(lessonId:string,code:string,title?:string): Promise<boolean> {
    unwrap(await apiClient.post('/fullstack/html/save-code',{lessonId,code,title:title || 'HTML Practice Code'}));return true;
  },
  async getSavedCode(lessonId:string): Promise<string|null> { return unwrap(await apiClient.get(`/fullstack/html/saved-code/${lessonId || 'general'}`)).code; },

  async getFullStackProgress(): Promise<import('../types/fullstack').FullStackCourseProgress> {
    return unwrap(await apiClient.get('/fullstack/course-progress'));
  },

  async getUserSkillsProgress(): Promise<{
    fullstack: { completedCount: number; totalLessons: number; percentage: number };
    promptEngineering: { completedCount: number; totalLessons: number; percentage: number };
    contextEngineering: { completedCount: number; totalLessons: number; percentage: number };
    aiAutomation: { completedCount: number; totalLessons: number; percentage: number };
    overallPercentage: number;
  }> {
    return unwrap(await apiClient.get('/fullstack/user-skills-progress'));
  },

  async getFullStackEligibility(): Promise<import('../types/fullstack').FullStackEligibility> {
    return unwrap(await apiClient.get('/fullstack/eligibility'));
  },

  async generateFullStackCertificate(): Promise<import('../types/fullstack').FullStackCertificateData> {
    const res = await apiClient.post('/fullstack/certificate/generate');
    if (!res.data?.success) {
      const err: any = new Error(res.data?.message || 'Failed to generate Full Stack Certificate');
      err.missingRequirements = res.data?.missingRequirements;
      throw err;
    }
    return res.data.data;
  },

  async getFullStackCertificate(): Promise<import('../types/fullstack').FullStackCertificateData> {
    return unwrap(await apiClient.get('/fullstack/certificate'));
  },

  async getCourse(courseSlug: string): Promise<HtmlCourse> {
    const payload = unwrap(await apiClient.get(`/fullstack/${courseSlug}/course`));
    return { ...payload.course, modules: payload.modules || [] };
  }
};
