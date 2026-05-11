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
    if (error) { console.error(error); return; }
    set((s) => ({ workers: [...s.workers, data as Worker] }));
  },

  updateWorker: async (id, updates) => {
    set((s) => ({ workers: s.workers.map((w) => (w.id === id ? { ...w, ...updates } : w)) }));
    await supabase.from('workers').update(updates).eq('id', id);
  },

  deleteWorker: async (id) => {
    set((s) => ({ workers: s.workers.filter((w) => w.id !== id) }));
    await supabase.from('workers').delete().eq('id', id);
  },

  toggleActive: async (id) => {
    const worker = get().workers.find((w) => w.id === id);
    if (!worker) return;
    const newStatus: WorkerStatus = worker.status === 'active' ? 'off-duty' : 'active';
    set((s) => ({ workers: s.workers.map((w) => (w.id === id ? { ...w, status: newStatus } : w)) }));
    await supabase.from('workers').update({ status: newStatus }).eq('id', id);
  },

  getWorkersByStatus: (status) => {
    return get().workers.filter((w) => w.status === status);
  },

  getWorkersByRole: () => {
    const groups: Record<string, Worker[]> = {};
    get().workers.forEach((w) => {
      if (!groups[w.role]) groups[w.role] = [];
      groups[w.role].push(w);
    });
    return groups;
  },

  get roleBreakdown() {
    const { workers } = get();
    const counts: Record<string, number> = {};
    workers.filter((w) => w.status === 'active').forEach((w) => {
      counts[w.role] = (counts[w.role] || 0) + 1;
    });
    return Object.entries(counts).map(([role, count]) => ({ role, count }));
  },
}));
