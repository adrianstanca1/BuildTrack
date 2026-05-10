import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { Equipment, EquipmentType, EquipmentStatus } from '../types/field';

interface EquipmentState {
  equipment: Equipment[];
  loading: boolean;
  error: string | null;

  setEquipment: (equipment: Equipment[]) => void;
  addEquipment: (item: Equipment) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  removeEquipment: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getEquipmentByProject: (projectId: string) => Equipment[];
  getEquipmentByStatus: (status: EquipmentStatus) => Equipment[];
  getEquipmentByType: (type: EquipmentType) => Equipment[];

  fetchEquipment: () => Promise<void>;
  createEquipment: (item: Omit<Equipment, 'id' | 'createdAt'>) => Promise<Equipment | null>;
  deleteEquipment: (id: string) => Promise<void>;
}

export const useEquipmentStore = create<EquipmentState>()(
  persist(
    (set, get) => ({
      equipment: [],
      loading: false,
      error: null,

      setEquipment: (equipment) => set({ equipment }),
      addEquipment: (item) => set((state) => ({ equipment: [item, ...state.equipment] })),
      updateEquipment: (id, updates) => set((state) => ({
        equipment: state.equipment.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      })),
      removeEquipment: (id) => set((state) => ({
        equipment: state.equipment.filter((e) => e.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getEquipmentByProject: (projectId) => get().equipment.filter((e) => e.projectId === projectId),
      getEquipmentByStatus: (status) => get().equipment.filter((e) => e.status === status),
      getEquipmentByType: (type) => get().equipment.filter((e) => e.type === type),

      fetchEquipment: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('equipment')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          const equipment = (data || []).map((item) => ({
            id: item.id,
            userId: item.user_id,
            projectId: item.project_id,
            projectName: item.project_name,
            name: item.name,
            type: item.type,
            make: item.make,
            model: item.model,
            serialNumber: item.serial_number,
            year: item.year,
            status: item.status,
            dailyRate: item.daily_rate,
            purchasePrice: item.purchase_price,
            purchaseDate: item.purchase_date,
            insuranceExpiry: item.insurance_expiry,
            motExpiry: item.mot_expiry,
            location: item.location,
            notes: item.notes,
            createdAt: item.created_at,
          }));

          set({ equipment, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch equipment', loading: false });
        }
      },

      createEquipment: async (item) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('equipment')
            .insert({
              project_id: item.projectId,
              project_name: item.projectName,
              name: item.name,
              type: item.type,
              make: item.make,
              model: item.model,
              serial_number: item.serialNumber,
              year: item.year,
              status: item.status,
              daily_rate: item.dailyRate,
              purchase_price: item.purchasePrice,
              purchase_date: item.purchaseDate,
              insurance_expiry: item.insuranceExpiry,
              mot_expiry: item.motExpiry,
              location: item.location,
              notes: item.notes,
            })
            .select()
            .single();

          if (error) throw error;

          const newEquipment: Equipment = {
            id: data.id,
            userId: data.user_id,
            projectId: data.project_id,
            projectName: data.project_name,
            name: data.name,
            type: data.type,
            make: data.make,
            model: data.model,
            serialNumber: data.serial_number,
            year: data.year,
            status: data.status,
            dailyRate: data.daily_rate,
            purchasePrice: data.purchase_price,
            purchaseDate: data.purchase_date,
            insuranceExpiry: data.insurance_expiry,
            motExpiry: data.mot_expiry,
            location: data.location,
            notes: data.notes,
            createdAt: data.created_at,
          };

          set((state) => ({ equipment: [newEquipment, ...state.equipment], loading: false }));
          return newEquipment;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create equipment', loading: false });
          return null;
        }
      },

      deleteEquipment: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('equipment').delete().eq('id', id);
          if (error) throw error;
          set((state) => ({
            equipment: state.equipment.filter((e) => e.id !== id),
            loading: false,
          }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete equipment', loading: false });
        }
      },
    }),
    {
      name: 'buildtrack-equipment-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ equipment: state.equipment }),
    }
  )
);
