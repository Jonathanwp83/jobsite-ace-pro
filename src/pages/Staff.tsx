
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { StaffList } from '@/components/StaffList';
import { StaffForm } from '@/components/StaffForm';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Staff } from '@/types/staff';

interface ContractorProfile {
  contact_name: string;
  subscription_plan: string;
}

const StaffPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

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

  const handleAddStaff = () => {
    setSelectedStaff(null);
    setView('add');
  };

  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setView('edit');
  };

  const handleSuccess = () => {
    setView('list');
    setSelectedStaff(null);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedStaff(null);
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
        <StaffList
          onAddStaff={handleAddStaff}
          onEditStaff={handleEditStaff}
        />
      )}
      {(view === 'add' || view === 'edit') && (
        <StaffForm
          staff={selectedStaff || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </DashboardLayout>
  );
};

export default StaffPage;
