
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CustomerList } from '@/components/CustomerList';
import { CustomerForm } from '@/components/CustomerForm';
import { DashboardLayout } from '@/components/DashboardLayout';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  notes: string;
  created_at: string;
}

interface ContractorProfile {
  contact_name: string;
  subscription_plan: string;
}

const Customers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('contact_name, subscription_plan')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setView('add');
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setView('edit');
  };

  const handleSuccess = () => {
    setView('list');
    setSelectedCustomer(null);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedCustomer(null);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      {view === 'list' && (
        <CustomerList
          onAddCustomer={handleAddCustomer}
          onEditCustomer={handleEditCustomer}
        />
      )}
      {(view === 'add' || view === 'edit') && (
        <CustomerForm
          customer={selectedCustomer || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </DashboardLayout>
  );
};

export default Customers;
