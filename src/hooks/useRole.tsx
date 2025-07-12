
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'contractor' | 'staff' | 'client' | null;

interface RoleContextType {
  userRole: UserRole;
  loading: boolean;
  isAdmin: boolean;
  isContractor: boolean;
  isStaff: boolean;
  isClient: boolean;
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
      // Use the updated get_user_role function that now supports all 4 roles
      const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', {
        _user_id: user.id
      });

      if (roleError) {
        console.error('❌ Error fetching user role:', roleError);
        setUserRole(null);
      } else {
        const role = roleData as UserRole;
        console.log('✅ User role determined:', role);
        setUserRole(role);
      }
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
    isClient: userRole === 'client',
    refreshRole,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};
