
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'contractor' | 'staff' | null;

interface RoleContextType {
  userRole: UserRole;
  loading: boolean;
  isAdmin: boolean;
  isContractor: boolean;
  isStaff: boolean;
  refreshRole: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserRole = async () => {
    if (!user) {
      console.log('🔍 No user found, setting role to null');
      setUserRole(null);
      setLoading(false);
      return;
    }

    console.log('🔍 Fetching role for user:', user.email, user.id);

    try {
      // PHASE 1: Check if user is Platform Admin (Contractor Pro employee)
      const { data: adminRoleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (adminRoleData) {
        console.log('✅ User is Platform Admin (Contractor Pro employee)');
        setUserRole('admin');
        setLoading(false);
        return;
      }

      // PHASE 2: Check if user is a Contractor Customer (paying customer)
      const { data: contractorData } = await supabase
        .from('contractors')
        .select('id, is_platform_admin')
        .eq('user_id', user.id)
        .eq('is_platform_admin', false)
        .single();

      if (contractorData?.id) {
        console.log('✅ User is a Contractor Customer (paying customer)');
        setUserRole('contractor');
        setLoading(false);
        return;
      }

      // PHASE 3: Check if user is Staff Member (contractor employee)
      const { data: staffData } = await supabase
        .from('staff')
        .select('id, contractor_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (staffData?.id) {
        console.log('✅ User is Staff Member (contractor employee)');
        setUserRole('staff');
        setLoading(false);
        return;
      }

      // If no role found
      console.log('⚠️ User has no assigned role');
      setUserRole(null);
    } catch (error) {
      console.error('❌ Error fetching user role:', error);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshRole = async () => {
    setLoading(true);
    await fetchUserRole();
  };

  useEffect(() => {
    fetchUserRole();
  }, [user]);

  const value = {
    userRole,
    loading,
    isAdmin: userRole === 'admin',
    isContractor: userRole === 'contractor',
    isStaff: userRole === 'staff',
    refreshRole,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};
