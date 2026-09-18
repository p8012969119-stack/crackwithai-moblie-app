import { ApiResponse, Course, Module, Lesson, UserProgress, Certificate } from '../types';
import { entityId, learningRequest } from './learningTransport';
import { ApiError } from './client';

export interface LessonActivity {
  lesson: string;
  readTopics: number[];
  practicedTopics: number[];
}

export interface LearningPath {
  course: Course;
  modules: Module[];
  lessons: Lesson[];
  progress: (UserProgress & { lessonActivity?: LessonActivity[] }) | null;
  certificate: Certificate | null;
  quiz: { _id: string; passingMarks: number; totalMarks: number; available?: boolean } | null;
  quizAttempt: { _id: string; status: string; percentage: number } | null;
  summary: {
    learningCompleted: boolean;
    courseCompleted: boolean;
    certified: boolean;
    progressPercentage: number;
    totalLessons: number;
    completedLessonCount: number;
    totalModules?: number;
    completedModulesCount?: number;
  };
}

export const learningApi = {
  getLearningPath: async (id: string, signal?: AbortSignal): Promise<ApiResponse<LearningPath>> => {
    const response = await learningRequest<LearningPath>('get', `/courses/${id}/learning-path`, undefined, signal);
    const path = response.data;
    if (!path?.course?._id || !Array.isArray(path.modules) || !Array.isArray(path.lessons) || !path.summary) {
      throw new ApiError('The learning path is unavailable. Please try again.', undefined, 'INVALID_LEARNING_DATA');
    }
    const lessons = path.lessons.map((lesson: Lesson & {completed?: boolean; unlocked?: boolean}) => ({
      ...lesson,
      isCompleted: lesson.completed,
      isUnlocked: lesson.unlocked,
    }));
    return {
      ...response,
      data: {
        ...path,
        lessons,
        modules: path.modules.map(module => ({
          ...module,
          lessons: lessons.filter(lesson => entityId(lesson.module) === module._id),
        })),
      },
    };
  },
};
