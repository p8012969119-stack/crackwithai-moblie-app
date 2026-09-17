export interface User {
  _id: string;
  id?: string;
  name: string;
  fullName?: string;
  email: string;
  role?: string;
  preferredLanguage?: 'en' | 'ta' | 'hi';
  streak?: number;
  xp?: number;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponseData {
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  code?: string;
  requiresVerification?: boolean;
  email?: string;
}

export interface Course {
  learningOutcomes?: string[];
  prerequisites?: string[];
  totalEstimatedMinutes?: number;
  learningStatus?: "not_started" | "in_progress" | "completed";
  certified?: boolean;
  courseCompleted?: boolean;
  lastAccessedAt?: string;
  _id: string;
  title: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  thumbnail?: string;
  logoUrl?: string;
  category?: string;
  price?: number;
  isFree?: boolean;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  progressPercentage?: number;
  completedLessonsCount?: number;
  totalLessonsCount?: number;
  totalLessons?: number;
  currentLessonOrder?: number;
  isLocked?: boolean;
  isEnrolled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Module {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  course: string;
  order: number;
  duration?: number;
  status?: 'draft' | 'published' | 'archived';
  lessons?: Lesson[];
  isUnlocked?: boolean;
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Topic {
  _id?: string;
  title: string;
  content: string;
  order?: number;
  examples?: string[];
  exampleHeading?: string;
  exampleText?: string;
  practiceGoal?: string;
  practicePlatform?: string;
  practiceSteps?: string[];
  practiceLabTitle?: string;
  practiceLabTool?: string;
  practiceLabSteps?: string[];
  expectedResult?: string;
  keyTakeaway?: string;
  imageUrl?: string;
}

export interface Lesson {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  course: string;
  module?: string | Module;
  content?: string;
  topics?: (Topic | string)[];
  topicContents?: any[];
  videoUrl?: string;
  resources?: string[];
  duration?: number;
  order: number;
  isPreview?: boolean;
  status?: 'draft' | 'published' | 'archived';
  isCompleted?: boolean;
  isRequired?: boolean;
  isUnlocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProgress {
  _id?: string;
  user: string;
  course: string;
  completedLessons: string[];
  completedModules?: string[];
  progressPercentage: number;
  lastAccessedLesson?: string;
  status?: string;
}

export interface QuizQuestion {
  _id?: string;
  question: string;
  questionType?: 'single' | 'multiple' | 'text';
  options: string[];
  correctAnswers?: string[];
  marks?: number;
  explanation?: string;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  course: string;
  module?: string;
  lesson?: string;
  questions: QuizQuestion[];
  totalMarks?: number;
  passingMarks?: number;
  timeLimit?: number;
  attemptsAllowed?: number;
  status?: string;
}

export interface QuizQuestionReview {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  options: string[];
}

export interface QuizResult {
  _id?: string;
  quiz: string | Quiz;
  user: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  submittedAt?: string;
  attemptNumber?: number;
  questionDetails?: QuizQuestionReview[];
}

export interface Certificate {
  _id: string;
  user: string | User;
  course: string | Course;
  recipientName?: string;
  certificateId?: string;
  issuedAt?: string;
  percentage?: number;
  userName?: string;
  courseName?: string;
  certificateNumber: string;
  issueDate: string;
  verificationCode: string;
  certificateUrl?: string;
  pdfUrl?: string;
  status?: 'active' | 'revoked';
}

export interface Bookmark {
  _id: string;
  user: string;
  itemType: 'lesson' | 'aitool' | 'topic';
  itemId: string;
  title?: string;
  subtitle?: string;
  courseId?: string;
  lesson?: Lesson;
  aiTool?: AiTool;
  createdAt: string;
}

export interface AiTool {
  _id: string;
  name: string;
  description: string;
  category?: string;
  slug: string;
  iconUrl?: string;
  logo?: string;
  flowType?: string;
  inputPlaceholder?: string;
  type?: 'chat' | 'code' | 'image' | 'email' | 'voice';
}

export interface DashboardData {
  courses?: Course[];
  currentCourseId?: string;
  averageProgress?: number;
  completedCourses?: number;
  totalLessonsCount?: number;
  totalModulesCount?: number;
  completedModulesCount?: number;
  learningMinutes?: number;
  user: User;
  greeting?: string;
  streak?: number;
  xp?: number;
  totalTimeSpentFormatted?: string;
  goalsAchieved?: number;
  enrolledCoursesCount?: number;
  completedCoursesCount?: number;
  completedLessonsCount?: number;
  certificatesCount?: number;
  bookmarksCount?: number;
  currentCourse?: Course;
  continueLearningLesson?: Lesson;
  recentBookmarks?: Bookmark[];
  recommendedCourses?: Course[];
  statSummary?: {
    totalHoursLearned?: number;
    streakDays?: number;
    completedLessons?: number;
  };
}
