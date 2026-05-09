import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export function useIncidents(params?: { projectId?: string; severity?: string }) {
  return useQuery({
    queryKey: ['incidents', params],
    queryFn: () => apiClient.getIncidents(params),
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incident: Record<string, any>) => apiClient.createIncident(incident),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incidents'] }),
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => apiClient.updateIncident(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incidents'] }),
  });
}

export function useDeleteIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteIncident(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incidents'] }),
  });
}
