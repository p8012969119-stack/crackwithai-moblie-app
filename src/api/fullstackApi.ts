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
  async getLesson(lessonId:string): Promise<HtmlLesson|null> { return unwrap(await apiClient.get(`/fullstack/html/lessons/${lessonId}`)).lesson; },
  async getProgress(): Promise<FullStackProgress> {
    const progress = unwrap(await apiClient.get('/fullstack/html/progress'));
    return {courseId:progress.courseId || 'html-from-beginner-to-practical',completedLessonIds:progress.completedLessons,totalLessons:progress.totalLessons,completedCount:progress.completedCount,percentage:progress.progressPercentage,lastLessonId:progress.currentLesson};
  },
  async completeLesson(lessonId:string, courseId?:string, code?:string): Promise<{success:boolean;completedLessonIds:string[];percentage:number}> {
    const progress=unwrap(await apiClient.post('/fullstack/html/progress/complete-lesson',{lessonId,courseId,code}));
    return {success:true,completedLessonIds:progress.completedLessons,percentage:progress.progressPercentage};
  },
  async saveCode(lessonId:string,code:string,title?:string): Promise<boolean> {
    unwrap(await apiClient.post('/fullstack/html/save-code',{lessonId,code,title:title || 'HTML Practice Code'}));return true;
  },
  async getSavedCode(lessonId:string): Promise<string|null> { return unwrap(await apiClient.get(`/fullstack/html/saved-code/${lessonId || 'general'}`)).code; },
};
