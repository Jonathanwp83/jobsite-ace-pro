import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminStats } from '@/components/admin/AdminStats';
import { ContractorManagement } from '@/components/admin/ContractorManagement';
import { ChatManagement } from '@/components/admin/ChatManagement';
import { InvoiceManagement } from '@/components/admin/InvoiceManagement';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut } from 'lucide-react';

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

interface Chat {
  id: string;
  visitor_name: string;
  visitor_email: string;
  message: string;
  response?: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
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
      fetchAdminData();
    }
  }, [isAdmin, roleLoading, navigate]);

  const fetchAdminData = async () => {
    try {
      // Fetch contractors
      const { data: contractorsData, error: contractorsError } = await supabase
        .from('contractors')
        .select('*')
        .order('created_at', { ascending: false });

      if (contractorsError) throw contractorsError;

      // Fetch chats
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (chatsError) throw chatsError;

      setContractors(contractorsData || []);
      setChats(chatsData || []);

      // Calculate enhanced stats
      const totalContractors = contractorsData?.length || 0;
      const activeSubscriptions = contractorsData?.filter(c => c.subscription_active).length || 0;
      const pendingChats = chatsData?.filter(c => c.status === 'pending').length || 0;
      const resolvedChats = chatsData?.filter(c => c.status === 'responded').length || 0;
      
      // Calculate monthly revenue (this would be more sophisticated in production)
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
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">ContractorPro Admin</h1>
              <Badge className="ml-3 bg-red-100 text-red-800">Platform Admin</Badge>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Platform Overview</h2>
            <p className="text-gray-600 mt-2">Manage contractors, subscriptions, and platform operations</p>
          </div>

          {/* Enhanced Stats Cards */}
          <AdminStats stats={stats} />

          {/* Contractor Management */}
          <ContractorManagement contractors={contractors} onRefresh={fetchAdminData} />

          {/* Chat Management */}
          <ChatManagement chats={chats} onRefresh={fetchAdminData} />

          {/* Invoice Management */}
          <InvoiceManagement />
        </div>
      </div>
    </div>
  );
}