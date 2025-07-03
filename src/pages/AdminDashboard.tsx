import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, CreditCard, Settings, Eye, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Contractor {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  subscription_plan: string;
  subscription_active: boolean;
  created_at: string;
}

interface Chat {
  id: string;
  visitor_name: string;
  visitor_email: string;
  message: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [stats, setStats] = useState({
    totalContractors: 0,
    activeSubscriptions: 0,
    pendingChats: 0,
    totalSignups: 0
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

      // Calculate stats
      const totalContractors = contractorsData?.length || 0;
      const activeSubscriptions = contractorsData?.filter(c => c.subscription_active).length || 0;
      const pendingChats = chatsData?.filter(c => c.status === 'pending').length || 0;

      setStats({
        totalContractors,
        activeSubscriptions,
        pendingChats,
        totalSignups: totalContractors
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

  const updateSubscription = async (contractorId: string, plan: 'starter' | 'professional' | 'enterprise', active: boolean) => {
    try {
      const { error } = await supabase
        .from('contractors')
        .update({ 
          subscription_plan: plan,
          subscription_active: active 
        })
        .eq('id', contractorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });

      fetchAdminData();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    }
  };

  const respondToChat = async (chatId: string, response: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ 
          response,
          status: 'responded'
        })
        .eq('id', chatId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Response sent successfully",
      });

      fetchAdminData();
    } catch (error) {
      console.error('Error responding to chat:', error);
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive",
      });
    }
  };

  if (roleLoading || loading) {
    return (
      <DashboardLayout profile={{ contact_name: 'Admin', subscription_plan: 'admin' }}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading admin dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardLayout profile={{ contact_name: 'Admin', subscription_plan: 'admin' }}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contractors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContractors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Chats</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingChats}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSignups}</div>
            </CardContent>
          </Card>
        </div>

        {/* Contractors Management */}
        <Card>
          <CardHeader>
            <CardTitle>Contractor Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contractors.map((contractor) => (
                <div key={contractor.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{contractor.company_name}</h3>
                    <p className="text-sm text-gray-600">{contractor.contact_name} • {contractor.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={contractor.subscription_active ? "default" : "secondary"}>
                      {contractor.subscription_plan}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSubscription(
                        contractor.id, 
                        contractor.subscription_plan === 'starter' ? 'professional' : 'starter',
                        !contractor.subscription_active
                      )}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Management */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Chat Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chats.map((chat) => (
                <div key={chat.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{chat.visitor_name || 'Anonymous'}</h3>
                      <p className="text-sm text-gray-600">{chat.visitor_email}</p>
                      <p className="mt-2">{chat.message}</p>
                    </div>
                    <Badge variant={chat.status === 'pending' ? "destructive" : "default"}>
                      {chat.status}
                    </Badge>
                  </div>
                  {chat.status === 'pending' && (
                    <div className="mt-4">
                      <Button
                        size="sm"
                        onClick={() => {
                          const response = prompt('Enter your response:');
                          if (response) {
                            respondToChat(chat.id, response);
                          }
                        }}
                      >
                        Respond
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}