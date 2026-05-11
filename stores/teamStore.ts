import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useSyncStore } from './syncStore';
import type { Worker, WorkerStatus } from '../types';

interface TeamState {
  workers: Worker[];
  loading: boolean;
  error: string | null;

  fetchWorkers: () => Promise<void>;
  addWorker: (worker: Omit<Worker, 'id' | 'createdAt'>) => Promise<void>;
  updateWorker: (id: string, updates: Partial<Worker>) => Promise<void>;
  deleteWorker: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;

  getWorkersByStatus: (status: string) => Worker[];
  getWorkersByRole: () => Record<string, Worker[]>;
  get roleBreakdown(): { role: string; count: number }[];
}

export const useTeamStore = create<TeamState>((set, get) => ({
  workers: [],
  loading: false,
  error: null,

  fetchWorkers: async () => {
    set({ loading: true });
    const { data, error } = await supabase.from('workers').select('*').order('name');
    if (error) { set({ error: error.message }); return; }
    set({ workers: data as Worker[], loading: false });
  },

  addWorker: async (worker) => {
    const { data, error } = await supabase.from('workers').insert(worker).select().single();
    if (error) {
      useSyncStore.getState().queueMutation('workers', 'insert', worker);
      return;
    }
    set((s) => ({ workers: [...s.workers, data as Worker] }));
  },

  updateWorker: async (id, updates) => {
    set((s) => ({ workers: s.workers.map((w) => (w.id === id ? { ...w, ...updates } : w)) }));
    const { error } = await supabase.from('workers').update(updates).eq('id', id);
    if (error) useSyncStore.getState().queueMutation('workers', 'update', { id, ...updates });
  },

  deleteWorker: async (id) => {
    set((s) => ({ workers: s.workers.filter((w) => w.id !== id) }));
    const { error } = await supabase.from('workers').delete().eq('id', id);
    if (error) useSyncStore.getState().queueMutation('workers', 'delete', { id });
  },

  toggleActive: async (id) => {
    const worker = get().workers.find((w) => w.id === id);
    if (!worker) return;
    const newStatus: WorkerStatus = worker.status === 'active' ? 'off-duty' : 'active';
    set((s) => ({ workers: s.workers.map((w) => (w.id === id ? { ...w, status: newStatus } : w)) }));
    const { error } = await supabase.from('workers').update({ status: newStatus }).eq('id', id);
    if (error) useSyncStore.getState().queueMutation('workers', 'update', { id, status: newStatus });
  },

  getWorkersByStatus: (status) => {
    return get().workers.filter((w) => w.status === status);
  },

  getWorkersByRole: () => {
    const workers = get().workers;
    return workers.reduce((acc: Record<string, Worker[]>, w) => {
      if (!acc[w.role]) acc[w.role] = [];
      acc[w.role].push(w);
      return acc;
    }, {});
  },

  get roleBreakdown() {
    const workers = get().workers;
    const roles = [...new Set(workers.map((w) => w.role))];
    return roles.map((role) => ({ role, count: workers.filter((w) => w.role === role).length }));
  },
}));
