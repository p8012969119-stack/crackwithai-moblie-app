export interface FullStackTrack {
  id: string;
  title: string;
  name?: string;
  subtitle?: string;
  slug?: string;
  icon: string;
  status: 'active' | 'upcoming';
  description: string;
  badge?: string;
  modulesCount?: number;
  lessonsCount?: number;
  duration?: string;
  level?: string;
  route?: string | null;
}

export interface PracticeValidationRule {
  tag?: string;
  minCount?: number;
  attribute?: string;
  valuePattern?: string;
  message: string;
}

export interface PracticeTask {
  title: string;
  description: string;
  requirements: string[];
  starterCode: string;
  expectedOutput: string;
  validationRules?: PracticeValidationRule[];
}

export interface HtmlLesson {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  order: number;
  description?: string;
  learningObjective?: string;
  concept?: string;
  codeExample?: string;
  expectedOutput?: string;
  starterCode: string;
  practiceTask?: PracticeTask;
  moduleId?: string;
  moduleTitle?: string;
  courseId?: string;
  completed?: boolean;
}

export interface HtmlModule {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  order: number;
  description: string;
  duration?: number;
  lessons: HtmlLesson[];
}

export interface HtmlCourse {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: string;
  level: string;
  difficulty?: string;
  duration: number;
  totalLessonMinutes?: number;
  totalPracticeMinutes?: number;
  totalEstimatedMinutes?: number;
  recommendedMinutesPerDay?: number;
  durationDays?: number;
  isFree?: boolean;
  status?: string;
  tags?: string[];
  learningOutcomes?: string[];
  modules: HtmlModule[];
  totalLessons?: number;
  completedLessons?: number;
  progressPercentage?: number;
  [key: string]: any;
}

export interface FullStackProgress {
  courseId: string;
  completedLessonIds: string[];
  totalLessons: number;
  completedCount: number;
  percentage: number;
  lastLessonId?: string;
}

export interface SavedHtmlCode {
  lessonId?: string;
  code: string;
  savedAt: string;
}
