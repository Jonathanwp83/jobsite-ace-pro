
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { JobList } from '@/components/JobList';
import { JobForm } from '@/components/JobForm';
import { DashboardLayout } from '@/components/DashboardLayout';

interface Job {
  id: string;
  title: string;
  description: string;
  customer_id: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimated_hours: number;
  hourly_rate: number;
  fixed_price: number;
  start_date: string;
  end_date: string;
  notes: string;
  created_at: string;
}

interface ContractorProfile {
  contact_name: string;
  subscription_plan: string;
}

const Jobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

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

  const handleAddJob = () => {
    setSelectedJob(null);
    setView('add');
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setView('edit');
  };

  const handleSuccess = () => {
    setView('list');
    setSelectedJob(null);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedJob(null);
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
        <JobList
          onAddJob={handleAddJob}
          onEditJob={handleEditJob}
        />
      )}
      {(view === 'add' || view === 'edit') && (
        <JobForm
          job={selectedJob || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </DashboardLayout>
  );
};

export default Jobs;
