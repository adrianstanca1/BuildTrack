import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, setActiveCompanyId } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Company {
  id: string;
  name: string;
  vat_number?: string | null;
  address?: string | null;
  owner_id: string;
}

interface CompanyContextType {
  company: Company | null;
  role: string | null;
  isLoading: boolean;
  refreshCompany: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCompany = useCallback(async () => {
    if (!user) {
      setCompany(null);
      setRole(null);
      await setActiveCompanyId(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Check company membership
      const { data: memberData, error: memberError } = await supabase
        .from('company_users')
        .select('company_id, role, companies:company_id(id, name, vat_number, address, owner_id)')
        .eq('user_id', user.id)
        . maybeSingle();

      if (!memberError && memberData && memberData.companies) {
        const c = Array.isArray(memberData.companies)
          ? memberData.companies[0]
          : memberData.companies;
        setCompany(c);
        setRole(memberData.role);
        await setActiveCompanyId(c.id);
        setIsLoading(false);
        return;
      }

      // 2. Fallback: check if user is an owner
      const { data: ownerData, error: ownerError } = await supabase
        .from('companies')
        .select('id, name, vat_number, address, owner_id')
        .eq('owner_id', user.id)
        . maybeSingle();

      if (!ownerError && ownerData) {
        setCompany(ownerData);
        setRole('owner');
        await setActiveCompanyId(ownerData.id);
        setIsLoading(false);
        return;
      }

      // No company
      setCompany(null);
      setRole(null);
      await setActiveCompanyId(null);
    } catch {
      setCompany(null);
      setRole(null);
      await setActiveCompanyId(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCompany();
  }, [refreshCompany]);

  return (
    <CompanyContext.Provider value={{ company, role, isLoading, refreshCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) throw new Error('useCompany must be used within CompanyProvider');
  return context;
}
