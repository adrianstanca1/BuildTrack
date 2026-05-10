import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { Material } from '../types/field';

interface MaterialsState {
  materials: Material[];
  loading: boolean;
  error: string | null;

  setMaterials: (materials: Material[]) => void;
  addMaterial: (material: Material) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  removeMaterial: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getMaterialsByProject: (projectId: string) => Material[];
  getMaterialsByCategory: (category: string) => Material[];
  getLowStockMaterials: () => Material[];

  fetchMaterials: () => Promise<void>;
  createMaterial: (material: Omit<Material, 'id' | 'createdAt'>) => Promise<Material | null>;
  deleteMaterial: (id: string) => Promise<void>;
}

export const useMaterialsStore = create<MaterialsState>()(
  persist(
    (set, get) => ({
      materials: [],
      loading: false,
      error: null,

      setMaterials: (materials) => set({ materials }),
      addMaterial: (material) => set((state) => ({ materials: [material, ...state.materials] })),
      updateMaterial: (id, updates) => set((state) => ({
        materials: state.materials.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      })),
      removeMaterial: (id) => set((state) => ({
        materials: state.materials.filter((m) => m.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getMaterialsByProject: (projectId) => get().materials.filter((m) => m.projectId === projectId),
      getMaterialsByCategory: (category) => get().materials.filter((m) => m.category === category),
      getLowStockMaterials: () => get().materials.filter((m) => m.reorderLevel > 0 && m.quantityOnHand <= m.reorderLevel),

      fetchMaterials: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('materials')
            .select('*')
            .order('updated_at', { ascending: false });

          if (error) throw error;

          const materials: Material[] = (data || []).map((item) => ({
            id: item.id,
            projectId: item.project_id,
            projectName: item.project_name || 'Unassigned',
            name: item.name,
            category: item.category,
            unit: item.unit,
            unitCost: item.unit_cost || 0,
            quantityOnHand: item.quantity_on_hand || 0,
            quantityOrdered: item.quantity_ordered || 0,
            reorderLevel: item.reorder_level || 0,
            reorderQuantity: item.reorder_quantity || 0,
            supplierName: item.supplier_name,
            location: item.location,
            notes: item.notes,
            createdAt: item.created_at,
          }));

          set({ materials, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch materials', loading: false });
        }
      },

      createMaterial: async (materialData) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('materials')
            .insert({
              project_id: materialData.projectId,
              project_name: materialData.projectName,
              name: materialData.name,
              category: materialData.category,
              unit: materialData.unit,
              unit_cost: materialData.unitCost,
              quantity_on_hand: materialData.quantityOnHand,
              quantity_ordered: materialData.quantityOrdered,
              reorder_level: materialData.reorderLevel,
              reorder_quantity: materialData.reorderQuantity,
              supplier_name: materialData.supplierName,
              location: materialData.location,
              notes: materialData.notes,
            })
            .select()
            .single();

          if (error) throw error;

          const material: Material = {
            id: data.id,
            projectId: data.project_id,
            projectName: data.project_name || 'Unassigned',
            name: data.name,
            category: data.category,
            unit: data.unit,
            unitCost: data.unit_cost || 0,
            quantityOnHand: data.quantity_on_hand || 0,
            quantityOrdered: data.quantity_ordered || 0,
            reorderLevel: data.reorder_level || 0,
            reorderQuantity: data.reorder_quantity || 0,
            supplierName: data.supplier_name,
            location: data.location,
            notes: data.notes,
            createdAt: data.created_at,
          };

          set((state) => ({ materials: [material, ...state.materials], loading: false }));
          return material;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create material', loading: false });
          return null;
        }
      },

      deleteMaterial: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('materials').delete().eq('id', id);
          if (error) throw error;
          set((state) => ({ materials: state.materials.filter((m) => m.id !== id), loading: false }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete material', loading: false });
        }
      },
    }),
    {
      name: 'buildtrack-materials',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ materials: state.materials }),
    }
  )
);
