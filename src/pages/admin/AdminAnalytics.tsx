import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/AdminLayout';
import { AdminStats } from '@/components/admin/AdminStats';
import { useToast } from '@/hooks/use-toast';

export default function AdminAnalytics() {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalContractors: 0,
    activeSubscriptions: 0,
    pendingChats: 0,
    totalSignups: 0,
    monthlyRevenue: 0,
    resolvedChats: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin, roleLoading, navigate]);

  const fetchAnalytics = async () => {
    try {
      // Fetch contractors
      const { data: contractorsData, error: contractorsError } = await supabase
        .from('contractors')
        .select('*');

      if (contractorsError) throw contractorsError;

      // Fetch chats
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*');

      if (chatsError) throw chatsError;

      // Calculate stats
      const totalContractors = contractorsData?.length || 0;
      const activeSubscriptions = contractorsData?.filter(c => c.subscription_active).length || 0;
      const pendingChats = chatsData?.filter(c => c.status === 'pending').length || 0;
      const resolvedChats = chatsData?.filter(c => c.status === 'responded').length || 0;
      const monthlyRevenue = activeSubscriptions * 99; // Rough estimate

      setStats({
        totalContractors,
        activeSubscriptions,
        pendingChats,
        totalSignups: totalContractors,
        monthlyRevenue,
        resolvedChats
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
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
            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
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
          <h2 className="text-3xl font-bold text-foreground">Platform Analytics</h2>
          <p className="text-muted-foreground mt-2">Monitor platform performance and key metrics</p>
        </div>

        <AdminStats stats={stats} />
      </div>
    </AdminLayout>
  );
}