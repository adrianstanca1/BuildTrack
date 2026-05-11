import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useSyncStore } from './syncStore';
import type { Project } from '../types';

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  selectedProject: Project | null;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setSelectedProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Supabase
  fetchProjects: () => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],
      loading: false,
      error: null,
      selectedProject: null,

      setProjects: (projects) => set({ projects }),
      addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      })),
      removeProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
      })),
      setSelectedProject: (project) => set({ selectedProject: project }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      fetchProjects: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          const projects = (data || []).map((item) => ({
            id: item.id,
            name: item.name,
            location: item.location,
            description: item.description,
            budget: item.budget,
            progress: item.progress,
            status: item.status,
            startDate: item.start_date,
            endDate: item.end_date,
            teamSize: item.team_size,
            latitude: item.latitude,
            longitude: item.longitude,
            createdAt: item.created_at,
          }));

          set({ projects, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch projects', loading: false });
        }
      },

      createProject: async (projectData) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('projects')
            .insert({
              name: projectData.name,
              location: projectData.location,
              description: projectData.description,
              budget: projectData.budget,
              progress: projectData.progress,
              status: projectData.status,
              start_date: projectData.startDate,
              end_date: projectData.endDate,
              team_size: projectData.teamSize,
              latitude: projectData.latitude,
              longitude: projectData.longitude,
            })
            .select()
            .single();

          if (error) throw error;

          const project: Project = {
            id: data.id,
            name: data.name,
            location: data.location,
            description: data.description,
            budget: data.budget,
            progress: data.progress,
            status: data.status,
            startDate: data.start_date,
            endDate: data.end_date,
            teamSize: data.team_size,
            latitude: data.latitude,
            longitude: data.longitude,
            createdAt: data.created_at,
          };

          set((state) => ({ projects: [project, ...state.projects], loading: false }));
          return project;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create project', loading: false });
          return null;
        }
      },

      deleteProject: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('projects').delete().eq('id', id);
          if (error) {
            useSyncStore.getState().queueMutation('projects', 'delete', { id });
            return;
          }
          set((state) => ({ projects: state.projects.filter((p) => p.id !== id), loading: false }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete project', loading: false });
        }
      },
    }),
    {
      name: 'buildtrack-projects',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ projects: state.projects }),
    }
  )
);
