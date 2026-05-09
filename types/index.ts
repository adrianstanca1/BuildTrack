// Shared type definitions for BuildTrack

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type InspectionStatus = 'pending' | 'passed' | 'failed';
export type WorkerRole = 'foreman' | 'electrician' | 'plumber' | 'carpenter' | 'mason' | 'laborer' | 'engineer' | 'safety-officer';
export type WorkerStatus = 'active' | 'off-duty' | 'on-leave';
export type UserRole = 'user' | 'admin' | 'super_admin';
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'cancelled' | 'trialing';

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
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt?: string;
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

export interface UserProfile {
  id: string;
  email?: string;
  role: UserRole;
  stripe_customer_id: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface TierLimits {
  tier: SubscriptionTier;
  max_projects: number;
  max_team_members: number;
  max_storage_gb: number;
  has_advanced_reports: boolean;
  has_audit_logs: boolean;
  has_priority_support: boolean;
  price_monthly_gbp: number;
}
