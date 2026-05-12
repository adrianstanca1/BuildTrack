import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';

export interface AnalyticsSummary {
  projectCount: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  onTimePercent: number;
  totalBudget: number;
  totalSpent: number;
  budgetVariance: number;
  totalIncidents: number;
  totalRFIs: number;
  overdueRate: number;
}

export function useAnalyticsSummary() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.getAnalyticsSummary();
      setData(res?.data || null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}
