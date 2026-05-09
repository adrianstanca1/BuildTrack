import { useEffect, useState } from 'react';
import { useBillingStore } from '../stores/billingStore';

export function useAdmin() {
  const isAdmin = useBillingStore((s) => s.isAdmin);
  const adminStats = useBillingStore((s) => s.adminStats);
  const allUsers = useBillingStore((s) => s.allUsers);
  const allSubscriptions = useBillingStore((s) => s.allSubscriptions);
  const loading = useBillingStore((s) => s.loading);
  const error = useBillingStore((s) => s.error);
  const checkAdminRole = useBillingStore((s) => s.checkAdminRole);
  const fetchAdminStats = useBillingStore((s) => s.fetchAdminStats);
  const fetchAllUsers = useBillingStore((s) => s.fetchAllUsers);

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
    allSubscriptions,
    loading,
    error,
    refresh: async () => {
      await fetchAdminStats();
      await fetchAllUsers();
    },
  };
}
