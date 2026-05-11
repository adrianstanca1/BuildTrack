import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useSyncStore } from './syncStore';
import type { Meeting, MeetingStatus } from '../types/field';

interface MeetingsState {
  meetings: Meeting[];
  loading: boolean;
  error: string | null;

  setMeetings: (meetings: Meeting[]) => void;
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  removeMeeting: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getMeetingsByProject: (projectId: string) => Meeting[];
  getMeetingsByStatus: (status: MeetingStatus) => Meeting[];

  fetchMeetings: () => Promise<void>;
  createMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt'>) => Promise<Meeting | null>;
  deleteMeeting: (id: string) => Promise<void>;
}

export const useMeetingsStore = create<MeetingsState>()(
  persist(
    (set, get) => ({
      meetings: [],
      loading: false,
      error: null,

      setMeetings: (meetings) => set({ meetings }),
      addMeeting: (meeting) => set((state) => ({ meetings: [meeting, ...state.meetings] })),
      updateMeeting: (id, updates) => set((state) => ({
        meetings: state.meetings.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      })),
      removeMeeting: (id) => set((state) => ({
        meetings: state.meetings.filter((m) => m.id !== id),
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getMeetingsByProject: (projectId) => get().meetings.filter((m) => m.projectId === projectId),
      getMeetingsByStatus: (status) => get().meetings.filter((m) => m.status === status),

      fetchMeetings: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('meetings')
            .select('*')
            .order('scheduled_at', { ascending: false });

          if (error) throw error;

          const meetings = (data || []).map((item) => ({
            id: item.id,
            projectId: item.project_id,
            projectName: item.project_name,
            title: item.title,
            meetingType: item.meeting_type,
            scheduledAt: item.scheduled_at,
            durationMinutes: item.duration_minutes,
            location: item.location,
            agenda: item.agenda,
            notes: item.notes,
            status: item.status,
            attendees: item.attendees || [],
            createdAt: item.created_at,
          }));

          set({ meetings, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch meetings', loading: false });
        }
      },

      createMeeting: async (meeting) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('meetings')
            .insert({
              project_id: meeting.projectId,
              project_name: meeting.projectName,
              title: meeting.title,
              meeting_type: meeting.meetingType,
              scheduled_at: meeting.scheduledAt,
              duration_minutes: meeting.durationMinutes,
              location: meeting.location,
              agenda: meeting.agenda,
              notes: meeting.notes,
              status: meeting.status,
              attendees: meeting.attendees,
            })
            .select()
            .single();

          if (error) throw error;

          const newMeeting: Meeting = {
            id: data.id,
            projectId: data.project_id,
            projectName: data.project_name,
            title: data.title,
            meetingType: data.meeting_type,
            scheduledAt: data.scheduled_at,
            durationMinutes: data.duration_minutes,
            location: data.location,
            agenda: data.agenda,
            notes: data.notes,
            status: data.status,
            attendees: data.attendees || [],
            createdAt: data.created_at,
          };

          set((state) => ({ meetings: [newMeeting, ...state.meetings], loading: false }));
          return newMeeting;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to create meeting', loading: false });
          return null;
        }
      },

      deleteMeeting: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('meetings').delete().eq('id', id);
          if (error) {
            useSyncStore.getState().queueMutation('meetings', 'delete', { id });
            return;
          }
          set((state) => ({
            meetings: state.meetings.filter((m) => m.id !== id),
            loading: false,
          }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete meeting', loading: false });
        }
      },
    }),
    {
      name: 'buildtrack-meetings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ meetings: state.meetings }),
    }
  )
);
