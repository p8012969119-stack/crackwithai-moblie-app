export interface ProjectFile {path: string; content: string}
export interface CurriculumLesson {
  _id: string; title: string; slug: string; order: number; objective: string; estimatedMinutes: number;
  sections: {title: string; body: string}[];
  examples: {language: string; code: string; explanation: string}[];
  commonMistakes: string[]; bestPractices: string[]; activity: string; sources: string[];
  checkpoint: {question: string; options: string[]};
}
export interface CurriculumModule {
  _id: string; title: string; topic: string; weekNumber: number; weekEnd: number;
  detailedContent: string[]; practicalProject: string; estimatedTime: string; objectives: string[];
  runtime: 'web' | 'react' | 'node' | 'document';
  totalLessons: number; completedLessons: string[]; readLessons: string[];
  status: 'Not Started' | 'In Progress' | 'Completed'; projectCompleted: boolean;
  practiceAvailable: boolean; lastLessonId?: string;
  reviewStatus?: 'none' | 'pending' | 'approved' | 'changes_requested'; reviewFeedback?: string;
}
export interface CurriculumProgress {
  totalWeeks: number; completedWeeks: number; totalModules: number; completedModules: number;
  totalLessons: number; completedLessons: number; percentage: number; lastWeekId?: string; lastLessonId?: string;
}
export interface Curriculum {
  course: {_id: string; title: string; description: string; duration: string; totalWeeks: number};
  months: {_id: string; monthNumber: number; title: string; modules: CurriculumModule[]}[];
  progress: CurriculumProgress;
}
export interface CurriculumTask {
  title: string; problem: string; requirements: string[]; expectedBehavior: string; reference: string;
  starterFiles: ProjectFile[];
}
export interface ModuleDetail {module: CurriculumModule; lessons: CurriculumLesson[]; task: CurriculumTask}
export interface WorkspaceData {files: ProjectFile[]; folders: string[]; revision: number}
export interface ProjectCheck {message: string; passed: boolean}
export interface CheckResult {checks: ProjectCheck[]; allPassed: boolean; note: string; workspace?: WorkspaceData; reviewRequired?: boolean}
