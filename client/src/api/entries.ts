import axios from 'axios';
import type { WorkEntry, CreateEntryDto } from '../types';

const api = axios.create({ baseURL: '/api' });

export const entriesApi = {
  getAll: (params?: { startDate?: string; endDate?: string; sort?: 'asc' | 'desc' }) =>
    api.get<WorkEntry[]>('/entries', { params }).then((r) => r.data),

  create: (data: CreateEntryDto) =>
    api.post<WorkEntry>('/entries', data).then((r) => r.data),

  update: ({ id, data }: { id: number; data: CreateEntryDto }) =>
    api.put<WorkEntry>(`/entries/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/entries/${id}`),
};
