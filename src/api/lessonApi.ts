import { learningRequest } from './learningTransport';
import { Lesson } from '../types';
export const lessonApi = {
  getLessonById: (id: string) => learningRequest<Lesson>('get', `/auth/lessons/${id}`),
  getLessonsByCourse: (id: string) => learningRequest<Lesson[]>('get', `/auth/lessons?course=${encodeURIComponent(id)}`),
  getLessonsByModule: (id: string) => learningRequest<Lesson[]>('get', `/auth/lessons?module=${encodeURIComponent(id)}`),
};
