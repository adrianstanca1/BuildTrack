import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export function useWorkers(params?: { role?: string; status?: string }) {
  return useQuery({
    queryKey: ['workers', params],
    queryFn: () => apiClient.getWorkers(params),
  });
}

export function useCreateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (worker: Record<string, any>) => apiClient.createWorker(worker),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workers'] }),
  });
}

export function useUpdateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => apiClient.updateWorker(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workers'] }),
  });
}

export function useDeleteWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteWorker(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workers'] }),
  });
}
