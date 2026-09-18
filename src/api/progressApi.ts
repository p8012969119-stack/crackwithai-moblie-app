import { learningRequest } from './learningTransport';
import { UserProgress } from '../types';

export interface LessonActivity { lesson: string; readTopics: number[]; practicedTopics: number[] }
export const progressApi = {
  getCourseProgress: (id: string) => learningRequest<UserProgress>('get', `/progress/course/${id}`),
  getCourseModulesFlow: (id: string) => learningRequest<any>('get', `/progress/course/${id}/modules`),
  completeLesson: (id: string, _courseId?: string) => learningRequest<UserProgress>('post', `/progress/lessons/${id}/complete`),
  recordActivity: (id: string, topicIndex: number, action: 'read' | 'practice') => learningRequest<LessonActivity>('post', `/progress/lessons/${id}/activity`, { topicIndex, action }),
};
