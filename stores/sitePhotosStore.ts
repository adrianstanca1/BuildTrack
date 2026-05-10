import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { SitePhoto } from '../types/field';

interface SitePhotosState {
  sitePhotos: SitePhoto[];
  loading: boolean;
  error: string | null;

  setSitePhotos: (photos: SitePhoto[]) => void;
  addSitePhoto: (photo: SitePhoto) => void;
  updateSitePhoto: (id: string, updates: Partial<SitePhoto>) => void;
  removeSitePhoto: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getSitePhotosByProject: (projectId: string) => SitePhoto[];

  fetchSitePhotos: () => Promise<void>;
  createSitePhoto: (photo: Omit<SitePhoto, 'id' | 'createdAt'>) => Promise<SitePhoto | null>;
  deleteSitePhoto: (id: string) => Promise<void>;
}

export const useSitePhotosStore = create<SitePhotosState>()(
  persist(
    (set, get) => ({
      sitePhotos: [],
      loading: false,
      error: null,

      setSitePhotos: (photos) => set({ sitePhotos: photos }),
      addSitePhoto: (photo) => set((state) => ({ sitePhotos: [photo, ...state.sitePhotos] })),
      updateSitePhoto: (id, updates) => set((state) => ({
        sitePhotos: state.sitePhotos.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      })),
      removeSitePhoto: (id) => set((state) => ({
        sitePhotos: state.sitePhotos.filter((p) => p.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getSitePhotosByProject: (projectId) => get().sitePhotos.filter((p) => p.projectId === projectId),

      fetchSitePhotos: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.from('site_photos').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          set({ sitePhotos: data || [], loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch site photos', loading: false });
        }
      },

      createSitePhoto: async (photo) => {
        try {
          const { data, error } = await supabase.from('site_photos').insert(photo).select().single();
          if (error) throw error;
          if (data) set((state) => ({ sitePhotos: [data, ...state.sitePhotos] }));
          return data;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create site photo' });
          return null;
        }
      },

      deleteSitePhoto: async (id) => {
        try {
          const { error } = await supabase.from('site_photos').delete().eq('id', id);
          if (error) throw error;
          set((state) => ({ sitePhotos: state.sitePhotos.filter((p) => p.id !== id) }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete site photo' });
        }
      },
    }),
    {
      name: 'site-photos-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ sitePhotos: state.sitePhotos }),
    }
  )
);
