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

export interface FullStackModuleProgress {
  moduleNumber: number;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  courseSlugs: string[];
  primaryCourseSlug: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  isCompleted: boolean;
  status: 'completed' | 'in_progress' | 'not_started';
}

export interface FullStackCertificateData {
  id?: string;
  certificateId: string;
  certificateNumber?: string;
  verificationCode?: string;
  recipientName: string;
  courseName: string;
  score?: number;
  percentage?: number;
  issuedAt: string;
  metadata?: {
    courseSlug?: string;
    curriculum?: string;
    modulesCompleted?: number;
    totalModules?: number;
    totalLessons?: number;
    grade?: string;
    verified?: boolean;
    technologies?: string[];
    [key: string]: any;
  };
}

export interface FullStackCourseProgress {
  courseTitle: string;
  courseSlug: string;
  totalModules: number;
  completedModules: number;
  totalLessons: number;
  completedLessons: number;
  overallPercentage: number;
  courseCompleted: boolean;
  certificateEligible: boolean;
  hasCertificate: boolean;
  certificateId: string | null;
  certificateNumber: string | null;
  verificationCode: string | null;
  certificate: FullStackCertificateData | null;
  modules: FullStackModuleProgress[];
}

export interface FullStackEligibility {
  eligible: boolean;
  courseCompleted: boolean;
  overallPercentage: number;
  completedModules: number;
  totalModules: number;
  totalLessons: number;
  completedLessons: number;
  missingRequirements: string[];
  hasCertificate: boolean;
  certificateId: string | null;
  certificate: FullStackCertificateData | null;
}
