import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  QuantumUserAnalytics,
  type UserAnalytics,
  type UserActivity,
  type UserSession,
  type AnalyticsDashboard,
  type PredictiveModel,
  type CohortAnalysis,
  type ModelPrediction,
} from '../lib/analytics/quantum-user-analytics';

export interface AnalyticsState {
  // persisted serializable state
  analyticsMap: Record<string, UserAnalytics>;
  dashboardsMap: Record<string, AnalyticsDashboard>;
  modelsMap: Record<string, PredictiveModel>;
  cohortsMap: Record<string, CohortAnalysis>;
  isActive: boolean;
  lastUpdated: string | null;

  // runtime engine (non-persisted)
  engine: QuantumUserAnalytics | null;

  // actions
  initialize: () => Promise<void>;
  trackSession: (userId: string, sessionData?: Partial<UserSession>) => Promise<void>;
  trackActivity: (userId: string, activity: Omit<UserActivity, 'id'>) => Promise<void>;
  getUserAnalytics: (userId: string) => UserAnalytics | null;
  getDashboards: () => AnalyticsDashboard[];
  getPredictiveModels: () => PredictiveModel[];
  getCohortAnalyses: () => CohortAnalysis[];
  runPrediction: (modelId: string, userId: string) => Promise<ModelPrediction | null>;
  exportAnalytics: (userId: string, format: 'json' | 'csv' | 'pdf') => Promise<any>;
  getStatus: () => any;
  cleanup: () => Promise<void>;
  syncFromEngine: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      analyticsMap: {},
      dashboardsMap: {},
      modelsMap: {},
      cohortsMap: {},
      isActive: false,
      lastUpdated: null,
      engine: null,

      initialize: async () => {
        const engine = new QuantumUserAnalytics();
        await engine.initialize();

        // hydrate engine from persisted state if available
        const state = get();
        const persistedUsers = Object.keys(state.analyticsMap);
        for (const userId of persistedUsers) {
          const ua = state.analyticsMap[userId];
          // we rehydrate by tracking sessions/activities again (simple merge)
          // or we could directly map internal maps but engine keeps private maps.
          // As a lightweight approach we feed back the sessions/activities.
          if (ua && ua.sessions && ua.sessions.length > 0) {
            // re-track last session metadata to warm up engine
            for (const s of ua.sessions) {
              await engine.trackSession(userId, s);
            }
          }
        }

        set({ engine, isActive: true, lastUpdated: new Date().toISOString() });
        get().syncFromEngine();
      },

      trackSession: async (userId, sessionData = {}) => {
        const { engine } = get();
        if (!engine) return;
        await engine.trackSession(userId, sessionData);
        get().syncFromEngine();
      },

      trackActivity: async (userId, activity) => {
        const { engine } = get();
        if (!engine) return;
        await engine.trackActivity(userId, activity);
        get().syncFromEngine();
      },

      getUserAnalytics: (userId) => {
        const { engine } = get();
        if (!engine) return null;
        return engine.getUserAnalytics(userId);
      },

      getDashboards: () => {
        const { engine } = get();
        if (!engine) return [];
        return engine.getDashboards();
      },

      getPredictiveModels: () => {
        const { engine } = get();
        if (!engine) return [];
        return engine.getPredictiveModels();
      },

      getCohortAnalyses: () => {
        const { engine } = get();
        if (!engine) return [];
        return engine.getCohortAnalyses();
      },

      runPrediction: async (modelId, userId) => {
        const { engine } = get();
        if (!engine) return null;
        const result = await engine.runPrediction(modelId, userId);
        get().syncFromEngine();
        return result;
      },

      exportAnalytics: async (userId, format) => {
        const { engine } = get();
        if (!engine) throw new Error('Analytics engine not initialized');
        return engine.exportAnalytics(userId, format);
      },

      getStatus: () => {
        const { engine } = get();
        if (!engine) return { isActive: false };
        return engine.getStatus();
      },

      cleanup: async () => {
        const { engine } = get();
        if (engine) {
          await engine.cleanup();
        }
        set({
          engine: null,
          isActive: false,
          analyticsMap: {},
          dashboardsMap: {},
          modelsMap: {},
          cohortsMap: {},
          lastUpdated: null,
        });
      },

      syncFromEngine: () => {
        const { engine } = get();
        if (!engine) return;
        const analyticsArr = engine.getAllAnalytics();
        const dashboards = engine.getDashboards();
        const models = engine.getPredictiveModels();
        const cohorts = engine.getCohortAnalyses();

        set({
          lastUpdated: new Date().toISOString(),
          analyticsMap: Object.fromEntries(analyticsArr.map((a) => [a.userId, a])),
          dashboardsMap: Object.fromEntries(dashboards.map((d) => [d.id, d])),
          modelsMap: Object.fromEntries(models.map((m) => [m.id, m])),
          cohortsMap: Object.fromEntries(cohorts.map((c) => [c.id, c])),
        });
      },
    }),
    {
      name: 'buildtrack-analytics-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) =>
        // persist only serializable state
        ({
          analyticsMap: state.analyticsMap,
          dashboardsMap: state.dashboardsMap,
          modelsMap: state.modelsMap,
          cohortsMap: state.cohortsMap,
          isActive: state.isActive,
          lastUpdated: state.lastUpdated,
        }),
    }
  )
);
