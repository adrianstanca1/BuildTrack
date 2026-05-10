// Field operations types for BuildTrack
// Defects, Permits, Timesheets — imported from cortexbuild-field

export type DefectStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type DefectSeverity = 'cosmetic' | 'minor' | 'major' | 'critical';
export type PermitType = 'building' | 'electrical' | 'plumbing' | 'demolition' | 'scaffolding' | 'general';
export type PermitStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'expired';
export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export type RfiStatus = 'draft' | 'submitted' | 'open' | 'answered' | 'closed';
export type SubmittalStatus = 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected';
export type DrawingStatus = 'active' | 'superseded' | 'archived';
export type InvoiceStatus = 'draft' | 'submitted' | 'approved' | 'paid' | 'overdue';

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

export interface Rfi {
  id: string;
  title: string;
  projectId?: string;
  projectName: string;
  status: RfiStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  question: string;
  answer?: string;
  assignedTo?: string;
  dueDate?: string;
  submittedBy: string;
  createdAt: string;
  answeredAt?: string;
}

export interface Submittal {
  id: string;
  title: string;
  projectId?: string;
  projectName: string;
  status: SubmittalStatus;
  type: 'material' | 'shop-drawing' | 'product-data' | 'sample' | 'mockup' | 'other';
  description: string;
  specSection?: string;
  submittedBy: string;
  reviewedBy?: string;
  reviewDate?: string;
  createdAt: string;
}

export interface Drawing {
  id: string;
  title: string;
  projectId?: string;
  projectName: string;
  status: DrawingStatus;
  revision: string;
  discipline: 'architectural' | 'structural' | 'mechanical' | 'electrical' | 'plumbing' | 'civil';
  uploadedBy: string;
  fileUrl?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId?: string;
  projectName: string;
  status: InvoiceStatus;
  amount: number;
  description: string;
  vendor?: string;
  issueDate: string;
  dueDate?: string;
  paidDate?: string;
  createdAt: string;
}
