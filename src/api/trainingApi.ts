import {learningRequest} from './learningTransport';
import {Course} from '../types';
import {normalizeCourses} from './courseData';

export interface TrainingReply {
  conversationId: string;
  message: string;
  recommendedCourse: Course | null;
  provider: string;
}
export const trainingApi = {
  async chat(message: string, conversationId?: string, signal?: AbortSignal): Promise<TrainingReply> {
    const response = await learningRequest<TrainingReply>('post', '/ai-training/chat', {message, conversationId}, signal);
    const value = response.data;
    if (!value || typeof value.message !== 'string' || !value.message.trim() || typeof value.conversationId !== 'string') throw new Error('The assistant returned an incomplete reply. Please try again.');
    const recommendedCourse = value.recommendedCourse ? normalizeCourses([value.recommendedCourse])[0] : null;
    return {...value, recommendedCourse: recommendedCourse || null};
  },
};
