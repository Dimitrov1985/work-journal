import axios from 'axios';
import type { WorkType } from '../types';

const api = axios.create({ baseURL: '/api' });

export const workTypesApi = {
  getAll: () => api.get<WorkType[]>('/work-types').then((r) => r.data),
};
