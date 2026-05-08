import { create } from 'zustand';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type InspectionStatus = 'pending' | 'passed' | 'failed';

export interface Incident {
  id: string;
  type: 'incident';
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
  type: 'inspection';
  title: string;
  projectId?: string;
  projectName: string;
  description: string;
  status: InspectionStatus;
  date: string;
  inspector: string;
  findings: string[];
}

interface SafetyState {
  incidents: Incident[];
  inspections: Inspection[];
  addIncident: (data: Partial<Incident>) => void;
  addInspection: (data: Partial<Inspection>) => void;
  getStats: () => { totalIncidents: number; totalInspections: number; daysSinceIncident: number };
}

const initialIncidents: Incident[] = [
  {
    id: 'inc-1',
    type: 'incident',
    title: 'Worker slipped on wet concrete',
    projectName: 'Riverside Apartments',
    description: 'Worker slipped while walking across freshly poured concrete section. No serious injuries.',
    severity: 'low',
    date: '2026-04-15',
    injuries: 0,
    witnesses: ['John Smith', 'Mike Johnson'],
    reportedBy: 'Sarah Chen',
  },
];

const initialInspections: Inspection[] = [
  {
    id: 'insp-1',
    type: 'inspection',
    title: 'Weekly Site Safety Inspection',
    projectName: 'Metro Office Tower',
    description: 'Routine safety inspection of construction site including scaffolding, PPE compliance, and hazard identification.',
    status: 'passed',
    date: '2026-05-06',
    inspector: 'Safety Officer Williams',
    findings: ['All PPE compliance verified', 'Scaffolding secure', 'First aid kits stocked'],
  },
  {
    id: 'insp-2',
    type: 'inspection',
    title: 'Electrical Systems Inspection',
    projectName: 'Community Center Renovation',
    description: 'Inspection of new electrical panel installation and wiring.',
    status: 'failed',
    date: '2026-05-07',
    inspector: 'Licensed Electrician Brown',
    findings: ['Improper grounding on sub-panel', 'Missing GFCI outlets in wet areas', 'Cable routing needs improvement'],
  },
];

export const useSafetyStore = create<SafetyState>()((set, get) => ({
  incidents: initialIncidents,
  inspections: initialInspections,

  addIncident: (data) => {
    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      type: 'incident',
      title: data.title || 'Untitled Incident',
      projectId: data.projectId,
      projectName: data.projectName || 'General',
      description: data.description || '',
      severity: data.severity || 'low',
      date: new Date().toISOString(),
      injuries: data.injuries || 0,
      witnesses: data.witnesses || [],
      reportedBy: 'Current User',
    };
    set({ incidents: [...get().incidents, newIncident] });
  },

  addInspection: (data) => {
    const newInspection: Inspection = {
      id: `insp-${Date.now()}`,
      type: 'inspection',
      title: data.title || 'Untitled Inspection',
      projectId: data.projectId,
      projectName: data.projectName || 'General',
      description: data.description || '',
      status: data.status || 'pending',
      date: new Date().toISOString(),
      inspector: data.inspector || 'Unassigned',
      findings: data.findings || [],
    };
    set({ inspections: [...get().inspections, newInspection] });
  },

  getStats: () => {
    const { incidents, inspections } = get();
    const lastIncident = incidents.length > 0
      ? new Date(Math.max(...incidents.map(i => new Date(i.date).getTime())))
      : new Date();
    const daysSince = Math.floor((Date.now() - lastIncident.getTime()) / (1000 * 60 * 60 * 24));

    return {
      totalIncidents: incidents.length,
      totalInspections: inspections.length,
      daysSinceIncident: daysSince,
    };
  },
}));
