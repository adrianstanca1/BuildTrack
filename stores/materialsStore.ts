import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { Material, MaterialCategory } from '../types/field';

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
  getMaterialsByCategory: (category: MaterialCategory) => Material[];
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
      getLowStockMaterials: () => get().materials.filter(
        (m) => m.quantityOnHand <= m.reorderLevel
      ),

      fetchMaterials: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('materials')
            .select('*')
            .order('name', { ascending: true });

          if (error) throw error;

          const materials = (data || []).map((item) => ({
            id: item.id,
            projectId: item.project_id,
            projectName: item.project_name,
            name: item.name,
            category: item.category,
            unit: item.unit,
            unitCost: item.unit_cost,
            quantityOnHand: item.quantity_on_hand,
            quantityOrdered: item.quantity_ordered,
            reorderLevel: item.reorder_level,
            reorderQuantity: item.reorder_quantity,
            supplierName: item.supplier_name,
            location: item.location,
            notes: item.notes,
            createdAt: item.created_at,
          }));

          set({ materials, loading: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to fetch materials',
            loading: false,
          });
        }
      },

      createMaterial: async (material) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('materials')
            .insert({
              project_id: material.projectId,
              project_name: material.projectName,
              name: material.name,
              category: material.category,
              unit: material.unit,
              unit_cost: material.unitCost,
              quantity_on_hand: material.quantityOnHand,
              quantity_ordered: material.quantityOrdered,
              reorder_level: material.reorderLevel,
              reorder_quantity: material.reorderQuantity,
              supplier_name: material.supplierName,
              location: material.location,
              notes: material.notes,
            })
            .select()
            .single();

          if (error) throw error;

          const newMaterial: Material = {
            id: data.id,
            projectId: data.project_id,
            projectName: data.project_name,
            name: data.name,
            category: data.category,
            unit: data.unit,
            unitCost: data.unit_cost,
            quantityOnHand: data.quantity_on_hand,
            quantityOrdered: data.quantity_ordered,
            reorderLevel: data.reorder_level,
            reorderQuantity: data.reorder_quantity,
            supplierName: data.supplier_name,
            location: data.location,
            notes: data.notes,
            createdAt: data.created_at,
          };

          set((state) => ({
            materials: [newMaterial, ...state.materials],
            loading: false,
          }));
          return newMaterial;
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to create material',
            loading: false,
          });
          return null;
        }
      },

      deleteMaterial: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('materials').delete().eq('id', id);
          if (error) throw error;
          set((state) => ({
            materials: state.materials.filter((m) => m.id !== id),
            loading: false,
          }));
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to delete material',
            loading: false,
          });
        }
      },
    }),
    {
      name: 'buildtrack-materials-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ materials: state.materials }),
    }
  )
);
