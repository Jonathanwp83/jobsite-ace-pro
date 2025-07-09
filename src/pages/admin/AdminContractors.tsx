import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/AdminLayout';
import { ContractorManagement } from '@/components/admin/ContractorManagement';
import { useToast } from '@/hooks/use-toast';

interface Contractor {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  subscription_plan: 'starter' | 'professional' | 'enterprise';
  subscription_active: boolean;
  created_at: string;
}

export default function AdminContractors() {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }
    if (isAdmin) {
      fetchContractors();
    }
  }, [isAdmin, roleLoading, navigate]);

  const fetchContractors = async () => {
    try {
      const { data: contractorsData, error: contractorsError } = await supabase
        .from('contractors')
        .select('*')
        .order('created_at', { ascending: false });

      if (contractorsError) throw contractorsError;
      setContractors(contractorsData || []);
    } catch (error) {
      console.error('Error fetching contractors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contractors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading contractors...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Contractor Management</h2>
          <p className="text-muted-foreground mt-2">Manage contractor accounts and subscriptions</p>
        </div>

        <ContractorManagement contractors={contractors} onRefresh={fetchContractors} />
      </div>
    </AdminLayout>
  );
}