import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export type DailyReportStatus = 'draft' | 'submitted' | 'approved';

export interface DailyReport {
  id: string;
  projectId: string;
  projectName: string;
  reportDate: string;
  weather?: string;
  temperature?: number;
  workersOnSite: number;
  workCompleted?: string;
  materialsUsed?: string;
  equipmentUsed?: string;
  issuesDelays?: string;
  safetyObservations?: string;
  nextDayPlan?: string;
  submittedBy: string;
  status: DailyReportStatus;
  createdAt: string;
}

interface DailyReportsState {
  reports: DailyReport[];
  loading: boolean;
  error: string | null;

  setReports: (reports: DailyReport[]) => void;
  addReport: (report: DailyReport) => void;
  updateReport: (id: string, updates: Partial<DailyReport>) => void;
  removeReport: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getReportsByProject: (projectId: string) => DailyReport[];
  getReportsByStatus: (status: DailyReportStatus) => DailyReport[];

  fetchReports: () => Promise<void>;
  createReport: (report: Omit<DailyReport, 'id' | 'createdAt'>) => Promise<DailyReport | null>;
  deleteReport: (id: string) => Promise<void>;
}

export const useDailyReportsStore = create<DailyReportsState>()(
  persist(
    (set, get) => ({
      reports: [],
      loading: false,
      error: null,

      setReports: (reports) => set({ reports }),
      addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),
      updateReport: (id, updates) => set((state) => ({
        reports: state.reports.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      })),
      removeReport: (id) => set((state) => ({
        reports: state.reports.filter((r) => r.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getReportsByProject: (projectId) => get().reports.filter((r) => r.projectId === projectId),
      getReportsByStatus: (status) => get().reports.filter((r) => r.status === status),

      fetchReports: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('daily_reports')
            .select('*')
            .order('report_date', { ascending: false });

          if (error) throw error;

          const reports = (data || []).map((item) => ({
            id: item.id,
            projectId: item.project_id,
            projectName: item.project_name,
            reportDate: item.report_date,
            weather: item.weather,
            temperature: item.temperature,
            workersOnSite: item.workers_on_site || 0,
            workCompleted: item.work_completed,
            materialsUsed: item.materials_used,
            equipmentUsed: item.equipment_used,
            issuesDelays: item.issues_delays,
            safetyObservations: item.safety_observations,
            nextDayPlan: item.next_day_plan,
            submittedBy: item.submitted_by,
            status: item.status,
            createdAt: item.created_at,
          }));

          set({ reports, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch daily reports', loading: false });
        }
      },

      createReport: async (reportData) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('daily_reports')
            .insert({
              project_id: reportData.projectId,
              project_name: reportData.projectName,
              report_date: reportData.reportDate,
              weather: reportData.weather,
              temperature: reportData.temperature,
              workers_on_site: reportData.workersOnSite,
              work_completed: reportData.workCompleted,
              materials_used: reportData.materialsUsed,
              equipment_used: reportData.equipmentUsed,
              issues_delays: reportData.issuesDelays,
              safety_observations: reportData.safetyObservations,
              next_day_plan: reportData.nextDayPlan,
              submitted_by: reportData.submittedBy,
              status: reportData.status,
            })
            .select()
            .single();

          if (error) throw error;

          const report: DailyReport = {
            id: data.id,
            projectId: data.project_id,
            projectName: data.project_name,
            reportDate: data.report_date,
            weather: data.weather,
            temperature: data.temperature,
            workersOnSite: data.workers_on_site || 0,
            workCompleted: data.work_completed,
            materialsUsed: data.materials_used,
            equipmentUsed: data.equipment_used,
            issuesDelays: data.issues_delays,
            safetyObservations: data.safety_observations,
            nextDayPlan: data.next_day_plan,
            submittedBy: data.submitted_by,
            status: data.status,
            createdAt: data.created_at,
          };

          set((state) => ({ reports: [report, ...state.reports], loading: false }));
          return report;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create daily report', loading: false });
          return null;
        }
      },

      deleteReport: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('daily_reports').delete().eq('id', id);
          if (error) throw error;
          set((state) => ({ reports: state.reports.filter((r) => r.id !== id), loading: false }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete daily report', loading: false });
        }
      },
    }),
    {
      name: 'buildtrack-daily-reports',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ reports: state.reports }),
    }
  )
);
