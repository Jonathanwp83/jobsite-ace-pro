
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
      // First check if user is a Contractor Pro platform admin
      const { data: contractorData } = await supabase
        .from('contractors')
        .select('is_platform_admin, id')
        .eq('user_id', user.id)
        .single();

      if (contractorData?.is_platform_admin) {
        console.log('✅ User is Contractor Pro platform admin');
        setUserRole('admin');
        setLoading(false);
        return;
      }

      // If they have a contractor record, they're a contractor (your customer)
      if (contractorData?.id) {
        console.log('✅ User is a contractor customer');
        setUserRole('contractor');
        setLoading(false);
        return;
      }

      // Check if they're staff of a contractor
      const { data: staffData } = await supabase
        .from('staff')
        .select('id, contractor_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (staffData?.id) {
        console.log('✅ User is staff member');
        setUserRole('staff');
        setLoading(false);
        return;
      }

      // If no records found, they might be a new user
      console.log('⚠️ User has no contractor or staff record');
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
