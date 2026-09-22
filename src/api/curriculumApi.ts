import api from './client';
import {Curriculum, ModuleDetail, WorkspaceData, CurriculumTask, CurriculumModule, CheckResult} from '../types/curriculum';
const data = <T,>(response: {data: {success: boolean; data: T; message?: string}}): T => {
  if (!response.data?.success) throw new Error(response.data?.message || 'Unable to load curriculum.');
  return response.data.data;
};
export const curriculumApi = {
  overview: async (signal?: AbortSignal) => data<Curriculum>(await api.get('/fullstack/curriculum', {signal})),
  module: async (id: string, signal?: AbortSignal) => data<ModuleDetail>(await api.get(`/fullstack/weeks/${id}`, {signal})),
  start: async (id: string) => data<ModuleDetail>(await api.post(`/fullstack/progress/${id}/start`)),
  read: async (id: string) => data<ModuleDetail>(await api.post(`/fullstack/lessons/${id}/read`)),
  complete: async (id: string, answer: number) => data<{passed: boolean; message: string; detail?: ModuleDetail}>(await api.post(`/fullstack/lessons/${id}/complete`, {answer})),
  workspace: async (id: string, signal?: AbortSignal) => data<{task: CurriculumTask; module: CurriculumModule; workspace: WorkspaceData}>(await api.get(`/fullstack/weeks/${id}/workspace`, {signal})),
  save: async (id: string, workspace: WorkspaceData) => data<WorkspaceData>(await api.put(`/fullstack/weeks/${id}/workspace`, workspace)),
  check: async (id: string, workspace: WorkspaceData) => data<CheckResult>(await api.post(`/fullstack/weeks/${id}/check`, workspace)),
  submit: async (id: string, workspace: WorkspaceData) => data<CheckResult>(await api.post(`/fullstack/project/${id}/complete`, workspace)),
  runtime: async () => data<{code: string}>(await api.get('/fullstack/preview-runtime', {timeout: 60000})),
  models: async () => data<{apiModel: string; name: string}[]>(await api.get('/chat/models')),
};
