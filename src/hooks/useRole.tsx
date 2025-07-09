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
      // Use the improved get_user_role function that checks both admin flags and user_roles
      const { data, error } = await supabase.rpc('get_user_role', {
        _user_id: user.id
      });

      console.log('🔍 RPC get_user_role result:', { data, error });

      if (error) {
        console.error('❌ Error fetching user role:', error);
        // Fallback: check if user is platform admin in contractors table
        const { data: contractorData } = await supabase
          .from('contractors')
          .select('is_platform_admin, email')
          .eq('user_id', user.id)
          .single();
        
        console.log('🔍 Fallback contractor data:', contractorData);
        
        if (contractorData?.is_platform_admin) {
          console.log('✅ User detected as admin via fallback');
          setUserRole('admin');
        } else {
          console.log('✅ User detected as contractor via fallback');
          setUserRole('contractor');
        }
      } else {
        console.log('✅ User role detected via RPC:', data);
        setUserRole(data as UserRole);
      }
    } catch (error) {
      console.error('❌ Error fetching user role:', error);
      setUserRole('contractor');
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