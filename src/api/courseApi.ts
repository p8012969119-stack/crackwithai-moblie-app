import { ApiResponse, Course, Module, Lesson, UserProgress, Certificate } from '../types';
import { entityId, learningRequest } from './learningTransport';
import {ApiError} from './client';
import {courseRecords, normalizeCourses, mergeCourseLearning} from './courseData';
import { FALLBACK_COURSES_DATA } from './courseFallbackData';

export interface CourseCatalogResponse extends ApiResponse<Course[]> {
  learningError?: string;
  progressAvailable: boolean;
}

export interface LearningPath {
  course: Course;
  modules: Module[];
  lessons: Lesson[];
  progress: (UserProgress & { lessonActivity?: LessonActivity[] }) | null;
  certificate: Certificate | null;
  quiz: { _id: string; passingMarks: number; totalMarks: number; available?: boolean } | null;
  quizAttempt: { _id: string; status: string; percentage: number } | null;
  summary: { learningCompleted: boolean; courseCompleted: boolean; certified: boolean; progressPercentage: number; totalLessons: number; completedLessonCount: number; totalModules?: number; completedModulesCount?: number };
}
export interface LessonActivity { lesson: string; readTopics: number[]; practicedTopics: number[] }
const order = ['zapier-ai-automation','gamma-ai-presentation','pika-ai-video-creator','notion-ai-productivity','runway-ai-video-generation','elevenlabs-ai-voice','perplexity-ai-research','canva-ai-design','github-copilot','cursor-ai-coding-assistant','nano-banana-ai','midjourney-ai-image-creation','claude-ai-professional','google-gemini-ai','chatgpt-mastery'];
export function sortCoursesInRequestedOrder(courses: Course[]) {
  return [...courses].sort((a,b) => (order.indexOf(a.slug || '') < 0 ? 999 : order.indexOf(a.slug || '')) - (order.indexOf(b.slug || '') < 0 ? 999 : order.indexOf(b.slug || '')));
}
const getLearningPath = async (id: string, signal?: AbortSignal): Promise<ApiResponse<LearningPath>> => {
  const response = await learningRequest<LearningPath>('get', `/courses/${id}/learning-path`, undefined, signal);
  const path = response.data;
  if (!path?.course?._id || !Array.isArray(path.modules) || !Array.isArray(path.lessons) || !path.summary) {
    throw new ApiError('The course roadmap is unavailable. Please try again.', undefined, 'INVALID_COURSE_DATA');
  }
  const lessons = path.lessons.map((lesson: Lesson & {completed?: boolean; unlocked?: boolean}) => ({ ...lesson, isCompleted: lesson.completed, isUnlocked: lesson.unlocked }));
  return { ...response, data: { ...path, lessons, modules: path.modules.map(module => ({ ...module, lessons: lessons.filter(lesson => entityId(lesson.module) === module._id) })) } };
};
export const courseApi = {
  getLearningPath,
  getAllCourses: async (signal?: AbortSignal): Promise<CourseCatalogResponse> => {
    const [catalog, progress, certificates] = await Promise.allSettled([
      learningRequest<unknown>('get', '/courses', undefined, signal).then(res => ({...res, data: normalizeCourses(res.data)})),
      learningRequest<unknown>('get', '/courses/my-learning', undefined, signal).then(res => courseRecords(res.data)),
      learningRequest<unknown>('get', '/certificates/my-certificates', undefined, signal).then(res => courseRecords(res.data)),
    ]);
    // Authentication failures still use the existing session invalidation flow.
    for (const result of [catalog, progress, certificates]) {
      if (result.status === 'rejected' && result.reason instanceof ApiError && result.reason.status === 401) throw result.reason;
    }
    if (signal?.aborted) throw new ApiError('Request cancelled.', undefined, 'ERR_CANCELED');
    const coursesData = catalog.status === 'fulfilled' ? catalog.value.data : FALLBACK_COURSES_DATA;
    return {
      success: true,
      message: 'Courses fetched successfully',
      data: sortCoursesInRequestedOrder(mergeCourseLearning(coursesData,
        progress.status === 'fulfilled' ? progress.value : undefined,
        certificates.status === 'fulfilled' ? certificates.value : undefined)),
      progressAvailable: progress.status === 'fulfilled',
      learningError: catalog.status === 'rejected'
        ? undefined
        : progress.status === 'rejected'
        ? 'Your learning progress is temporarily unavailable. You can still explore courses.'
        : certificates.status === 'rejected' ? 'Certificate status is temporarily unavailable. Your courses are still available.' : undefined,
    };
  },
  getMyLearning: async (): Promise<ApiResponse<Course[]>> => {
    const response = await courseApi.getAllCourses();
    if (!response.progressAvailable) throw new ApiError('Your learning progress is temporarily unavailable. Please try again.');
    return { ...response, data: response.data.filter(course => course.isEnrolled) };
  },
  getCourseById: (id: string) => learningRequest<Course>('get', `/courses/${id}`),
  enrollCourse: (id: string) => learningRequest<any>('post', `/courses/${id}/enroll`),
  startCourse: (id: string) => learningRequest<LearningPath>('post', `/courses/${id}/start`),
  getCourseStatus: getLearningPath,
};
