// Field operations types for BuildTrack
// Defects, Permits, Timesheets — imported from cortexbuild-field

export type DefectStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type DefectSeverity = 'cosmetic' | 'minor' | 'major' | 'critical';
export type PermitType = 'building' | 'electrical' | 'plumbing' | 'demolition' | 'scaffolding' | 'general';
export type PermitStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'expired';
export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface Defect {
  id: string;
  title: string;
  description: string;
  projectId?: string;
  projectName: string;
  status: DefectStatus;
  severity: DefectSeverity;
  location: string;
  reportedBy: string;
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
  photos?: string[];
}

export interface Permit {
  id: string;
  title: string;
  type: PermitType;
  projectId?: string;
  projectName: string;
  status: PermitStatus;
  description: string;
  issuedDate?: string;
  expiryDate?: string;
  issuer: string;
  referenceNumber: string;
  createdAt: string;
}

export interface Timesheet {
  id: string;
  workerId: string;
  workerName: string;
  projectId?: string;
  projectName: string;
  date: string;
  hoursWorked: number;
  overtime: number;
  status: TimesheetStatus;
  notes?: string;
  createdAt: string;
}
