import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useSyncStore } from './syncStore';
import type { Timesheet, TimesheetStatus, TimesheetCategory } from '../types/field';

interface TimesheetsState {
  timesheets: Timesheet[];
  loading: boolean;
  error: string | null;

  setTimesheets: (timesheets: Timesheet[]) => void;
  addTimesheet: (timesheet: Timesheet) => void;
  updateTimesheet: (id: string, updates: Partial<Timesheet>) => Promise<void>;
  removeTimesheet: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getTimesheetsByProject: (projectId: string) => Timesheet[];
  getTimesheetsByWorker: (workerId: string) => Timesheet[];
  getTimesheetsByStatus: (status: TimesheetStatus) => Timesheet[];
  getTotalHoursForDate: (date: string) => number;
  getTotalPayForDate: (date: string) => number;

  fetchTimesheets: () => Promise<void>;
  createTimesheet: (timesheet: Omit<Timesheet, 'id' | 'createdAt'>) => Promise<Timesheet | null>;
  deleteTimesheet: (id: string) => Promise<void>;
}

export const useTimesheetsStore = create<TimesheetsState>()(
  persist(
    (set, get) => ({
      timesheets: [],
      loading: false,
      error: null,

      setTimesheets: (timesheets) => set({ timesheets }),
      addTimesheet: (timesheet) => set((state) => ({ timesheets: [timesheet, ...state.timesheets] })),
      updateTimesheet: async (id, updates) => {
        set((state) => ({
          timesheets: state.timesheets.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        }));
        const { error } = await supabase.from('timesheets').update(updates).eq('id', id);
        if (error) {
          useSyncStore.getState().queueMutation('timesheets', 'update', { id, ...updates });
        }
      },
      removeTimesheet: (id) => set((state) => ({
        timesheets: state.timesheets.filter((t) => t.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getTimesheetsByProject: (projectId) => get().timesheets.filter((t) => t.projectId === projectId),
      getTimesheetsByWorker: (workerId) => get().timesheets.filter((t) => t.workerId === workerId),
      getTimesheetsByStatus: (status) => get().timesheets.filter((t) => t.status === status),
      getTotalHoursForDate: (date) =>
        get().timesheets
          .filter((t) => t.date === date)
          .reduce((sum, t) => sum + t.hoursWorked + t.overtimeHours, 0),
      getTotalPayForDate: (date) =>
        get().timesheets
          .filter((t) => t.date === date)
          .reduce((sum, t) => sum + t.totalPay, 0),

      fetchTimesheets: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('timesheets')
            .select('*')
            .order('date', { ascending: false });

          if (error) throw error;

          const timesheets: Timesheet[] = (data || []).map((item) => ({
            id: item.id,
            workerId: item.worker_id ?? '',
            workerName: '',
            workerRole: undefined,
            projectId: item.project_id ?? undefined,
            projectName: '',
            date: item.date,
            hoursWorked: item.hours_worked ?? 0,
            overtimeHours: item.overtime_hours ?? 0,
            hourlyRate: 0,
            overtimeRate: 0,
            workDescription: item.notes ?? undefined,
            category: 'regular' as TimesheetCategory,
            status: (item.status ?? 'submitted') as TimesheetStatus,
            notes: item.notes ?? undefined,
            totalPay: 0,
            createdAt: item.created_at ?? new Date().toISOString(),
          }));

          set({ timesheets, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch timesheets', loading: false });
        }
      },

      createTimesheet: async (timesheetData) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('timesheets')
            .insert({
              worker_id: timesheetData.workerId,
              worker_name: timesheetData.workerName,
              worker_role: timesheetData.workerRole,
              project_id: timesheetData.projectId,
              project_name: timesheetData.projectName,
              date: timesheetData.date,
              hours_worked: timesheetData.hoursWorked,
              overtime_hours: timesheetData.overtimeHours,
              hourly_rate: timesheetData.hourlyRate,
              overtime_rate: timesheetData.overtimeRate,
              work_description: timesheetData.workDescription,
              category: timesheetData.category,
              status: timesheetData.status,
              notes: timesheetData.notes,
              total_pay: timesheetData.totalPay,
            })
            .select()
            .single();

          if (error) throw error;

          const timesheet: Timesheet = {
            id: data.id,
            workerId: data.worker_id ?? '',
            workerName: '',
            workerRole: undefined,
            projectId: data.project_id ?? undefined,
            projectName: '',
            date: data.date,
            hoursWorked: data.hours_worked ?? 0,
            overtimeHours: data.overtime_hours ?? 0,
            hourlyRate: 0,
            overtimeRate: 0,
            workDescription: data.notes ?? undefined,
            category: 'regular' as TimesheetCategory,
            status: (data.status ?? 'submitted') as TimesheetStatus,
            notes: data.notes ?? undefined,
            totalPay: 0,
            createdAt: data.created_at ?? new Date().toISOString(),
          };

          set((state) => ({ timesheets: [timesheet, ...state.timesheets], loading: false }));
          return timesheet;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create timesheet', loading: false });
          return null;
        }
      },

      deleteTimesheet: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('timesheets').delete().eq('id', id);
          if (error) {
            useSyncStore.getState().queueMutation('timesheets', 'delete', { id });
            return;
          }
          set((state) => ({ timesheets: state.timesheets.filter((t) => t.id !== id), loading: false }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete timesheet', loading: false });
        }
      },
    }),
    {
      name: 'buildtrack-timesheets',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ timesheets: state.timesheets }),
    }
  )
);
