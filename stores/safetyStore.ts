import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Incident, Inspection } from '../types';
import { useSyncStore } from './syncStore';

interface SafetyState {
  incidents: Incident[];
  inspections: Inspection[];
  loading: boolean;
  error: string | null;

  // Incidents
  fetchIncidents: () => Promise<void>;
  addIncident: (incident: Omit<Incident, 'id' | 'createdAt'>) => Promise<void>;
  updateIncident: (id: string, updates: Partial<Incident>) => Promise<void>;
  deleteIncident: (id: string) => Promise<void>;

  // Inspections
  fetchInspections: () => Promise<void>;
  addInspection: (inspection: Omit<Inspection, 'id' | 'createdAt'>) => Promise<void>;
  updateInspection: (id: string, updates: Partial<Inspection>) => Promise<void>;
  deleteInspection: (id: string) => Promise<void>;

  // Photos
  uploadPhoto: (file: { uri: string; fileName: string; mimeType: string }) => Promise<string | null>;

  // Stats
  getStats: () => { daysSinceIncident: number; totalIncidents: number; totalInspections: number };
}

// Re-export types for convenience
export type { IncidentSeverity, InspectionStatus } from '../types';

export const useSafetyStore = create<SafetyState>((set, get) => ({
  incidents: [],
  inspections: [],
  loading: false,
  error: null,

  fetchIncidents: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.from('incidents').select('*').order('date', { ascending: false });
      if (error) throw error;
      set({ incidents: data as Incident[] });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  addIncident: async (incident) => {
    const { data, error } = await supabase.from('incidents').insert(incident).select().single();
    if (error) {
      // Queue offline
      useSyncStore.getState().queueMutation('incidents', 'insert', incident as any);
      return;
    }
    set((s) => ({ incidents: [data as Incident, ...s.incidents] }));
  },

  updateIncident: async (id, updates) => {
    set((s) => ({ incidents: s.incidents.map((i) => (i.id === id ? { ...i, ...updates } : i)) }));
    const { error } = await supabase.from('incidents').update(updates).eq('id', id);
    if (error) console.error('Update incident error:', error);
  },

  deleteIncident: async (id) => {
    set((s) => ({ incidents: s.incidents.filter((i) => i.id !== id) }));
    const { error } = await supabase.from('incidents').delete().eq('id', id);
    if (error) console.error('Delete incident error:', error);
  },

  fetchInspections: async () => {
    try {
      const { data, error } = await supabase.from('inspections').select('*').order('date', { ascending: false });
      if (error) throw error;
      set({ inspections: data as Inspection[] });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  addInspection: async (inspection) => {
    const { data, error } = await supabase.from('inspections').insert(inspection).select().single();
    if (error) { console.error('Add inspection error:', error); return; }
    set((s) => ({ inspections: [data as Inspection, ...s.inspections] }));
  },

  updateInspection: async (id, updates) => {
    set((s) => ({ inspections: s.inspections.map((i) => (i.id === id ? { ...i, ...updates } : i)) }));
    await supabase.from('inspections').update(updates).eq('id', id);
  },

  deleteInspection: async (id) => {
    set((s) => ({ inspections: s.inspections.filter((i) => i.id !== id) }));
    await supabase.from('inspections').delete().eq('id', id);
  },

  getStats: () => {
    const { incidents, inspections } = get();
    const totalIncidents = incidents.length;
    const totalInspections = inspections.length;
    const lastIncidentDate = incidents.length > 0
      ? Math.max(...incidents.map(i => new Date(i.date).getTime()))
      : null;
    const daysSinceIncident = lastIncidentDate
      ? Math.floor((Date.now() - lastIncidentDate) / (1000 * 60 * 60 * 24))
      : 0;
    return { daysSinceIncident, totalIncidents, totalInspections };
  },

  uploadPhoto: async (file) => {
    try {
      const path = `incidents/${Date.now()}_${file.fileName}`;
      const { data, error } = await supabase.storage.from('buildtrack-photos').upload(path, {
        uri: file.uri,
        type: file.mimeType,
        name: file.fileName,
      } as any);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('buildtrack-photos').getPublicUrl(path);
      return urlData.publicUrl;
    } catch (e) {
      console.error('Photo upload error:', e);
      return null;
    }
  },
}));
