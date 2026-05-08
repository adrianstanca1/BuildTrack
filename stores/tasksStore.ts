import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId?: string;
  projectName: string;
  assignedTo: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  isOverdue: boolean;
}

interface TasksState {
  tasks: Task[];
  addTask: (task: Partial<Task>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByAssignee: (name: string) => Task[];
  getOverdueTasks: () => Task[];
  getTodayTasks: () => Task[];
  getUpcomingTasks: () => Task[];
}

const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Pour foundation concrete',
    description: 'Complete foundation slab pour for Building A, sections 1-4. Ensure temperature control during curing.',
    projectId: 'proj-1',
    projectName: 'Riverside Apartments',
    assignedTo: 'Mike Johnson',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2026-05-10',
    createdAt: '2026-05-01',
    isOverdue: false,
  },
  {
    id: 'task-2',
    title: 'Install steel framework - Floor 5-10',
    description: 'Erect structural steel columns and beams for floors 5 through 10. Coordinate crane schedule.',
    projectId: 'proj-2',
    projectName: 'Metro Office Tower',
    assignedTo: 'Sarah Chen',
    priority: 'urgent',
    status: 'pending',
    dueDate: '2026-05-12',
    createdAt: '2026-05-03',
    isOverdue: false,
  },
  {
    id: 'task-3',
    title: 'Complete HVAC ductwork',
    description: 'Install remaining ductwork in basement and ground floor areas. Pressure test required.',
    projectId: 'proj-3',
    projectName: 'Community Center Renovation',
    assignedTo: 'Tom Wilson',
    priority: 'medium',
    status: 'in-progress',
    dueDate: '2026-05-08',
    createdAt: '2026-05-02',
    isOverdue: true,
  },
  {
    id: 'task-4',
    title: 'Electrical panel upgrade',
    description: 'Replace main electrical panel and install new sub-panels for expanded capacity.',
    projectId: 'proj-3',
    projectName: 'Community Center Renovation',
    assignedTo: 'Lisa Rodriguez',
    priority: 'high',
    status: 'pending',
    dueDate: '2026-05-15',
    createdAt: '2026-05-04',
    isOverdue: false,
  },
  {
    id: 'task-5',
    title: 'Roof waterproofing inspection',
    description: 'Conduct final inspection of waterproofing membrane on Building A rooftop before green roof installation.',
    projectId: 'proj-1',
    projectName: 'Riverside Apartments',
    assignedTo: 'Mike Johnson',
    priority: 'medium',
    status: 'completed',
    dueDate: '2026-05-05',
    createdAt: '2026-04-28',
    completedAt: '2026-05-04',
    isOverdue: false,
  },
];

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: initialTasks,

      addTask: (taskData) => {
        const dueDate = new Date(taskData.dueDate || new Date());
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newTask: Task = {
          id: `task-${Date.now()}`,
          title: taskData.title || 'Untitled Task',
          description: taskData.description || '',
          projectId: taskData.projectId,
          projectName: taskData.projectName || 'No Project',
          assignedTo: taskData.assignedTo || 'Unassigned',
          priority: taskData.priority || 'medium',
          status: taskData.status || 'pending',
          dueDate: taskData.dueDate || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          isOverdue: dueDate < today && taskData.status !== 'completed',
        };
        set({ tasks: [...get().tasks, newTask] });
      },

      updateTask: (id, updates) => {
        set({
          tasks: get().tasks.map(t => {
            if (t.id !== id) return t;
            const updated = { ...t, ...updates };
            const dueDate = new Date(updated.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            updated.isOverdue = dueDate < today && updated.status !== 'completed';
            return updated;
          }),
        });
      },

      updateTaskStatus: (id, status) => {
        const updates: Partial<Task> = { status };
        if (status === 'completed') {
          updates.completedAt = new Date().toISOString();
          updates.isOverdue = false;
        }
        get().updateTask(id, updates);
      },

      deleteTask: (id) => {
        set({ tasks: get().tasks.filter(t => t.id !== id) });
      },

      getTasksByProject: (projectId) => {
        return get().tasks.filter(t => t.projectId === projectId);
      },

      getTasksByAssignee: (name) => {
        return get().tasks.filter(t => t.assignedTo === name);
      },

      getOverdueTasks: () => {
        return get().tasks.filter(t => t.isOverdue);
      },

      getTodayTasks: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().tasks.filter(t => t.dueDate === today && t.status !== 'completed');
      },

      getUpcomingTasks: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().tasks.filter(t => t.dueDate > today && t.status !== 'completed');
      },
    }),
    {
      name: 'tasks-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
