import { learningRequest } from './learningTransport';
export interface LearningQuestion { _id: string; question: string; options: {id: string; text: string}[] }
export interface LearningQuiz { _id: string; title: string; questions: LearningQuestion[]; passingMarks: number; totalMarks: number }
export const quizApi = {
  getCourseQuiz: (id: string) => learningRequest<LearningQuiz>('get', `/quizzes/course/${id}`),
  getLessonQuiz: (id: string) => learningRequest<LearningQuiz>('get', `/lessons/${id}/quiz`),
  startQuiz: (id: string) => learningRequest<{ attemptId: string; quiz: LearningQuiz }>('post', `/quizzes/${id}/start`),
  checkLessonAnswer: (id: string, payload: {quizId: string; questionId: string; selectedOptionId: string}) => learningRequest<any>('post', `/lessons/${id}/quiz/check-answer`, payload),
  submitAnswer: (id: string, payload: {attemptId: string; questionId: string; selectedOptionId: string}) => learningRequest<any>('post', `/quizzes/${id}/answer`, payload),
  submitQuiz: (id: string, payload: {attemptId: string}) => learningRequest<any>('post', `/quizzes/${id}/submit`, payload),
  submitLessonQuiz: (id: string, payload: {quizId: string; attemptKey: string; answers: { questionId: string; selectedOptionId: string }[]}) => learningRequest<any>('post', `/lessons/${id}/quiz/submit`, payload),
  getAttemptResult: (id: string) => learningRequest<any>('get', `/quizzes/attempts/${id}/result`),
};
