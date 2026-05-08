import { create } from 'zustand';

export type WorkerRole = 'foreman' | 'electrician' | 'plumber' | 'carpenter' | 'mason' | 'laborer' | 'engineer' | 'safety-officer';
export type WorkerStatus = 'active' | 'off-duty' | 'on-leave';

export interface Worker {
  id: string;
  name: string;
  role: WorkerRole;
  status: WorkerStatus;
  phone: string;
  email: string;
  weeklyHours: number;
  certifications: string[];
  projectAssignments: string[];
}

interface TeamState {
  workers: Worker[];
  addWorker: (worker: Partial<Worker>) => void;
  updateWorker: (id: string, updates: Partial<Worker>) => void;
  getWorkersByStatus: (status: WorkerStatus) => Worker[];
  getWorkersByRole: () => Record<WorkerRole, number>;
}

const initialWorkers: Worker[] = [
  {
    id: 'w-1',
    name: 'Mike Johnson',
    role: 'foreman',
    status: 'active',
    phone: '+1-555-0101',
    email: 'mike.j@buildtrack.com',
    weeklyHours: 45,
    certifications: ['OSHA 30', 'First Aid'],
    projectAssignments: ['proj-1', 'proj-2'],
  },
  {
    id: 'w-2',
    name: 'Sarah Chen',
    role: 'engineer',
    status: 'active',
    phone: '+1-555-0102',
    email: 'sarah.c@buildtrack.com',
    weeklyHours: 40,
    certifications: ['PE License', 'LEED AP'],
    projectAssignments: ['proj-2'],
  },
  {
    id: 'w-3',
    name: 'Tom Wilson',
    role: 'electrician',
    status: 'active',
    phone: '+1-555-0103',
    email: 'tom.w@buildtrack.com',
    weeklyHours: 42,
    certifications: ['Licensed Electrician', 'NFPA 70E'],
    projectAssignments: ['proj-3'],
  },
  {
    id: 'w-4',
    name: 'Lisa Rodriguez',
    role: 'plumber',
    status: 'active',
    phone: '+1-555-0104',
    email: 'lisa.r@buildtrack.com',
    weeklyHours: 40,
    certifications: ['Licensed Plumber'],
    projectAssignments: ['proj-3'],
  },
  {
    id: 'w-5',
    name: 'James Brown',
    role: 'carpenter',
    status: 'active',
    phone: '+1-555-0105',
    email: 'james.b@buildtrack.com',
    weeklyHours: 38,
    certifications: ['Carpentry Master'],
    projectAssignments: ['proj-1'],
  },
  {
    id: 'w-6',
    name: 'Emma Davis',
    role: 'safety-officer',
    status: 'active',
    phone: '+1-555-0106',
    email: 'emma.d@buildtrack.com',
    weeklyHours: 40,
    certifications: ['OSHA 30', 'CSP', 'First Aid Instructor'],
    projectAssignments: ['proj-1', 'proj-2', 'proj-3'],
  },
  {
    id: 'w-7',
    name: 'Carlos Martinez',
    role: 'mason',
    status: 'on-leave',
    phone: '+1-555-0107',
    email: 'carlos.m@buildtrack.com',
    weeklyHours: 0,
    certifications: ['Masonry License'],
    projectAssignments: [],
  },
  {
    id: 'w-8',
    name: 'Anna Kim',
    role: 'laborer',
    status: 'active',
    phone: '+1-555-0108',
    email: 'anna.k@buildtrack.com',
    weeklyHours: 35,
    certifications: ['Forklift Operator'],
    projectAssignments: ['proj-2'],
  },
];

export const useTeamStore = create<TeamState>()((set, get) => ({
  workers: initialWorkers,

  addWorker: (workerData) => {
    const newWorker: Worker = {
      id: `w-${Date.now()}`,
      name: workerData.name || 'Unnamed Worker',
      role: workerData.role || 'laborer',
      status: workerData.status || 'active',
      phone: workerData.phone || '',
      email: workerData.email || '',
      weeklyHours: workerData.weeklyHours || 0,
      certifications: workerData.certifications || [],
      projectAssignments: workerData.projectAssignments || [],
    };
    set({ workers: [...get().workers, newWorker] });
  },

  updateWorker: (id, updates) => {
    set({
      workers: get().workers.map(w =>
        w.id === id ? { ...w, ...updates } : w
      ),
    });
  },

  getWorkersByStatus: (status) => {
    return get().workers.filter(w => w.status === status);
  },

  getWorkersByRole: () => {
    const breakdown: Record<string, number> = {};
    get().workers.forEach(w => {
      breakdown[w.role] = (breakdown[w.role] || 0) + 1;
    });
    return breakdown;
  },
}));
