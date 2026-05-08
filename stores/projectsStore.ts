import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  location: string;
  description?: string;
  budget: number;
  progress: number;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  teamSize: number;
  createdAt: string;
}

interface ProjectsState {
  projects: Project[];
  addProject: (project: Partial<Project>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
}

const initialProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Riverside Apartments',
    location: '123 River Rd, Downtown',
    description: 'Luxury apartment complex with 120 units, underground parking, and rooftop amenities.',
    budget: 2500000,
    progress: 65,
    status: 'active',
    startDate: '2026-01-15',
    endDate: '2026-12-31',
    teamSize: 45,
    createdAt: '2026-01-10',
  },
  {
    id: 'proj-2',
    name: 'Metro Office Tower',
    location: '456 Metro Ave, Business District',
    description: '30-story commercial office building with LEED Platinum certification goals.',
    budget: 8500000,
    progress: 30,
    status: 'active',
    startDate: '2026-02-01',
    endDate: '2027-06-30',
    teamSize: 120,
    createdAt: '2026-01-20',
  },
  {
    id: 'proj-3',
    name: 'Community Center Renovation',
    location: '789 Oak St, Westside',
    description: 'Renovation of existing community center including HVAC, electrical, and accessibility upgrades.',
    budget: 450000,
    progress: 90,
    status: 'active',
    startDate: '2026-03-01',
    endDate: '2026-06-15',
    teamSize: 20,
    createdAt: '2026-02-15',
  },
];

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: initialProjects,

      addProject: (projectData) => {
        const newProject: Project = {
          id: `proj-${Date.now()}`,
          name: projectData.name || 'Untitled Project',
          location: projectData.location || '',
          description: projectData.description || '',
          budget: projectData.budget || 0,
          progress: projectData.progress || 0,
          status: projectData.status || 'planning',
          startDate: projectData.startDate || new Date().toISOString(),
          endDate: projectData.endDate || new Date().toISOString(),
          teamSize: projectData.teamSize || 0,
          createdAt: new Date().toISOString(),
        };
        set({ projects: [...get().projects, newProject] });
      },

      updateProject: (id, updates) => {
        set({
          projects: get().projects.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
        });
      },

      deleteProject: (id) => {
        set({ projects: get().projects.filter(p => p.id !== id) });
      },

      getProjectById: (id) => {
        return get().projects.find(p => p.id === id);
      },
    }),
    {
      name: 'projects-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
