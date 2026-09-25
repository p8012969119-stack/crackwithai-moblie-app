import apiClient from './client';
import {FullStackTrack, HtmlCourse, HtmlLesson, FullStackProgress} from '../types/fullstack';
// Legacy HTML deep links remain supported. Personal data is authoritative on the server:
// never merge the old device-wide completion or code keys into an authenticated account.
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
    const slug = courseSlug || 'html';
    const progress = unwrap(await apiClient.get(`/fullstack/${slug}/progress`));
    return {
      courseId: progress.courseId || slug,
      completedLessonIds: progress.completedLessons || [],
      totalLessons: progress.totalLessons || 0,
      completedCount: progress.completedCount || 0,
      percentage: progress.progressPercentage || 0,
      lastLessonId: progress.currentLesson
    };
  },
  async completeLesson(lessonId: string, courseSlug: string = 'html', code?: string): Promise<{ success: boolean; completedLessonIds: string[]; percentage: number }> {
    const slug = courseSlug || 'html';
    const progress = unwrap(await apiClient.post(`/fullstack/${slug}/progress/complete-lesson`, { lessonId, courseSlug: slug, code }));
    return { success: true, completedLessonIds: progress.completedLessons || [], percentage: progress.progressPercentage || 0 };
  },
  async saveCode(lessonId:string,code:string,title?:string): Promise<boolean> {
    unwrap(await apiClient.post('/fullstack/html/save-code',{lessonId,code,title:title || 'HTML Practice Code'}));return true;
  },
  async getSavedCode(lessonId:string): Promise<string|null> { return unwrap(await apiClient.get(`/fullstack/html/saved-code/${lessonId || 'general'}`)).code; },

  async getFullStackProgress(): Promise<import('../types/fullstack').FullStackCourseProgress> {
    return unwrap(await apiClient.get('/fullstack/course-progress'));
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
