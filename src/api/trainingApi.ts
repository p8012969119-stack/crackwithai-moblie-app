import {learningRequest} from './learningTransport';

export interface TrainingReply {
  conversationId: string;
  message: string;
  recommendedCourse?: any;
  provider: string;
}

export const trainingApi = {
  async chat(message: string, conversationId?: string, signal?: AbortSignal): Promise<TrainingReply> {
    const response = await learningRequest<TrainingReply>('post', '/ai-training/chat', {message, conversationId}, signal);
    const value = response.data;
    if (!value || typeof value.message !== 'string' || !value.message.trim() || typeof value.conversationId !== 'string') {
      throw new Error('The assistant returned an incomplete reply. Please try again.');
    }
    return value;
  },
};
