import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Project {
  id: string;
  name: string;
  location: string;
  description?: string;
  budget: number;
  progress: number;
  status: string;
  start_date: string;
  end_date: string;
  team_size: number;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function useProjectsList(search?: string, status?: string) {
  return useQuery({
    queryKey: ['projects-list', search, status],
    queryFn: async () => {
      let q = supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (status) q = q.eq('status', status);
      if (search) q = q.ilike('name', `%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data as Project[];
    },
  });
}

export function useProjectDetail(id: string) {
  return useQuery({
    queryKey: ['project-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Project;
    },
    enabled: !!id,
  });
}

export function useProjectStats(id: string) {
  return useQuery({
    queryKey: ['project-stats', id],
    queryFn: async () => {
      const [{ data: tasks }, { data: incidents }, { data: workers }] = await Promise.all([
        supabase.from('tasks').select('status').eq('project_id', id),
        supabase.from('incidents').select('severity').eq('project_id', id),
        supabase.from('workers').select('id', { count: 'exact' }),
      ]);
      const taskCount = tasks?.length ?? 0;
      const completedCount = tasks?.filter((t) => t.status === 'completed').length ?? 0;
      const openIncidents = incidents?.filter((i) => i.severity !== 'low').length ?? 0;
      return { taskCount, completedCount, openIncidents, workerCount: workers?.length ?? 0 };
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData.user?.id;
      if (!user_id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...project, user_id })
        .select()
        .single();
      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects-list'] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as Project;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['projects-list'] });
      qc.invalidateQueries({ queryKey: ['project-detail', vars.id] });
    },
  });
}
