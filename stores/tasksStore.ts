import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useSyncStore } from './syncStore';
import type { Task } from '../types';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  removeTask: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  getTodayTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getTasksByStatus: (status: string) => Task[];
  
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task | null>;
  toggleTaskStatus: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],
      loading: false,
      error: null,

      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      updateTask: async (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
        const { error } = await supabase.from('tasks').update(updates).eq('id', id);
        if (error) {
          useSyncStore.getState().queueMutation('tasks', 'update', { id, ...updates });
        }
      },
      removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getTodayTasks: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().tasks.filter((t) => t.dueDate === today);
      },
      getOverdueTasks: () => get().tasks.filter((t) => t.isOverdue && t.status !== 'completed'),
      getTasksByProject: (projectId) => get().tasks.filter((t) => t.projectId === projectId),
      getTasksByStatus: (status) => get().tasks.filter((t) => t.status === status),

      fetchTasks: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          const tasks = (data || []).map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            projectId: item.project_id,
            projectName: item.project_name,
            assignedTo: item.assigned_to,
            priority: item.priority,
            status: item.status,
            dueDate: item.due_date,
            completedAt: item.completed_at,
            isOverdue: item.is_overdue,
            createdAt: item.created_at,
          }));

          set({ tasks, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch tasks', loading: false });
        }
      },

      createTask: async (taskData) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('tasks')
            .insert({
              title: taskData.title,
              description: taskData.description,
              project_id: taskData.projectId,
              project_name: taskData.projectName,
              assigned_to: taskData.assignedTo,
              priority: taskData.priority,
              status: taskData.status,
              due_date: taskData.dueDate,
              is_overdue: taskData.isOverdue,
            })
            .select()
            .single();

          if (error) throw error;

          const task: Task = {
            id: data.id,
            title: data.title,
            description: data.description,
            projectId: data.project_id,
            projectName: data.project_name,
            assignedTo: data.assigned_to,
            priority: data.priority,
            status: data.status,
            dueDate: data.due_date,
            completedAt: data.completed_at,
            isOverdue: data.is_overdue,
            createdAt: data.created_at,
          };

          set((state) => ({ tasks: [task, ...state.tasks], loading: false }));
          return task;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create task', loading: false });
          return null;
        }
      },

      toggleTaskStatus: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        const updates: Partial<Task> = { status: newStatus };
        
        if (newStatus === 'completed') {
          updates.completedAt = new Date().toISOString();
        } else {
          updates.completedAt = undefined;
        }

        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));

        try {
          const { error } = await supabase
            .from('tasks')
            .update({
              status: newStatus,
              completed_at: updates.completedAt,
            })
            .eq('id', id);

          if (error) throw error;
        } catch (err) {
          // Revert on error
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? { ...t, status: task.status, completedAt: task.completedAt } : t)),
          }));
        }
      },

      deleteTask: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('tasks').delete().eq('id', id);
          if (error) {
            useSyncStore.getState().queueMutation('tasks', 'delete', { id });
            return;
          }
          set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id), loading: false }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete task', loading: false });
        }
      },
    }),
    {
      name: 'buildtrack-tasks',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);
