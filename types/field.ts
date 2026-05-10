// Field operations types for BuildTrack
// Defects, Permits, Timesheets — imported from cortexbuild-field

export type DefectStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type DefectSeverity = 'cosmetic' | 'minor' | 'major' | 'critical';
export type PermitType = 'building' | 'electrical' | 'plumbing' | 'demolition' | 'scaffolding' | 'general';
export type PermitStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'expired';
export type TimesheetStatus = 'submitted' | 'approved' | 'rejected' | 'paid';
export type TimesheetCategory = 'regular' | 'overtime' | 'weekend' | 'holiday' | 'sick' | 'leave';

export type RfiStatus = 'draft' | 'submitted' | 'open' | 'answered' | 'closed';
export type SubmittalStatus = 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected';
export type DrawingStatus = 'active' | 'superseded' | 'archived';
export type InvoiceStatus = 'draft' | 'submitted' | 'approved' | 'paid' | 'overdue';

export type PunchItemStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type PunchItemSeverity = 'cosmetic' | 'minor' | 'major' | 'critical';
export type DelayNoteStatus = 'open' | 'resolved' | 'closed';
export type MeetingType = 'safety_toolbox' | 'standup' | 'client_walkthrough' | 'change_order' | 'quality_review' | 'progress_review' | 'closeout' | 'other';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type PurchaseOrderStatus = 'draft' | 'sent' | 'acknowledged' | 'partially_delivered' | 'delivered' | 'invoiced' | 'paid' | 'cancelled';

export type EquipmentType = 'excavator' | 'bulldozer' | 'crane' | 'loader' | 'dump_truck' | 'mixer' | 'generator' | 'scaffold' | 'scissor_lift' | 'forklift' | 'compactor' | 'other';
export type EquipmentStatus = 'available' | 'rented' | 'on_site' | 'under_maintenance' | 'out_of_service' | 'retired';

export interface PurchaseOrderItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

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
  workerRole?: string;
  projectId?: string;
  projectName: string;
  date: string;
  hoursWorked: number;
  overtimeHours: number;
  hourlyRate: number;
  overtimeRate: number;
  workDescription?: string;
  category: TimesheetCategory;
  status: TimesheetStatus;
  notes?: string;
  totalPay: number;
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

export interface PunchItem {
  id: string;
  title: string;
  projectId?: string;
  projectName: string;
  status: PunchItemStatus;
  severity: PunchItemSeverity;
  location?: string;
  assignee?: string;
  photoUrls?: string[];
  createdAt: string;
  resolvedAt?: string;
}

export interface SitePhoto {
  id: string;
  projectId?: string;
  projectName: string;
  location?: string;
  tags: string[];
  caption?: string;
  photoUrl: string;
  uploadedBy: string;
  createdAt: string;
}

export interface DelayNote {
  id: string;
  projectId?: string;
  projectName: string;
  status: DelayNoteStatus;
  reason: string;
  description?: string;
  linkedRfiId?: string;
  createdAt: string;
}

export interface MeetingAttendee {
  name: string;
  role: string;
  email: string;
  present: boolean;
}

export interface PurchaseOrder {
  id: string;
  projectId?: string;
  projectName: string;
  poNumber: string;
  title: string;
  description?: string;
  vendorName: string;
  vendorEmail?: string;
  vendorPhone?: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  deliveryDate?: string;
  expectedDelivery?: string;
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  projectId?: string;
  projectName: string;
  title: string;
  meetingType: MeetingType;
  scheduledAt: string;
  durationMinutes: number;
  location?: string;
  agenda?: string;
  notes?: string;
  status: MeetingStatus;
  attendees: MeetingAttendee[];
  createdAt: string;
}

export interface Equipment {
  id: string;
  userId?: string;
  projectId?: string;
  projectName: string;
  name: string;
  type: EquipmentType;
  make?: string;
  model?: string;
  serialNumber?: string;
  year?: number;
  status: EquipmentStatus;
  dailyRate?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  insuranceExpiry?: string;
  motExpiry?: string;
  location?: string;
  notes?: string;
  createdAt: string;
}
