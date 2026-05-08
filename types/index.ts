// Shared type definitions for BuildTrack

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type InspectionStatus = 'pending' | 'passed' | 'failed';
export type WorkerRole = 'foreman' | 'electrician' | 'plumber' | 'carpenter' | 'mason' | 'laborer' | 'engineer' | 'safety-officer';
export type WorkerStatus = 'active' | 'off-duty' | 'on-leave';

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

export interface Incident {
  id: string;
  title: string;
  projectId?: string;
  projectName: string;
  description: string;
  severity: IncidentSeverity;
  date: string;
  injuries: number;
  witnesses: string[];
  reportedBy: string;
}

export interface Inspection {
  id: string;
  title: string;
  projectId?: string;
  projectName: string;
  description: string;
  status: InspectionStatus;
  date: string;
  inspector: string;
  findings: string[];
}

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
