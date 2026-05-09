import { useEffect } from 'react';
import { useAdminStore } from '../stores/billingStore';

export function useAdmin() {
  const isAdmin = useAdminStore((s) => s.isAdmin);
  const adminStats = useAdminStore((s) => s.adminStats);
  const allUsers = useAdminStore((s) => s.allUsers);
  const loading = useAdminStore((s) => s.loading);
  const error = useAdminStore((s) => s.error);
  const checkAdminRole = useAdminStore((s) => s.checkAdminRole);
  const fetchAdminStats = useAdminStore((s) => s.fetchAdminStats);
  const fetchAllUsers = useAdminStore((s) => s.fetchAllUsers);

  useEffect(() => {
    checkAdminRole().then((admin) => {
      if (admin) {
        fetchAdminStats();
        fetchAllUsers();
      }
    });
  }, [checkAdminRole, fetchAdminStats, fetchAllUsers]);

  return {
    isAdmin,
    adminStats,
    allUsers,
    loading,
    error,
    refresh: async () => {
      await fetchAdminStats();
      await fetchAllUsers();
    },
  };
}
