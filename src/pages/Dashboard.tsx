
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Clock
} from 'lucide-react';

interface ContractorProfile {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  subscription_plan: string;
  staff_limit: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { userRole, isAdmin, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    jobs: 0,
    customers: 0,
    staff: 0,
    revenue: 0
  });

  useEffect(() => {
    console.log('🔍 Dashboard useEffect:', { user: user?.email, isAdmin, userRole, roleLoading });
    
    if (!user) {
      console.log('❌ No user, redirecting to auth');
      navigate('/auth');
      return;
    }
    
    // Wait for role loading to complete
    if (roleLoading) {
      console.log('⏳ Role still loading, waiting...');
      return;
    }
    
    // Redirect Platform Admins to admin dashboard
    if (isAdmin && userRole === 'admin') {
      console.log('✅ User is Platform Admin, redirecting to admin dashboard');
      navigate('/admin');
      return;
    }
    
    // Handle Contractor Customers and Staff Members
    if (userRole === 'contractor') {
      console.log('✅ User is Contractor Customer, fetching business data');
      fetchContractorProfile();
    } else if (userRole === 'staff') {
      console.log('✅ User is Staff Member, fetching contractor business data');
      fetchStaffContractorProfile();
    } else if (userRole === null) {
      console.log('⚠️ User has no role assigned');
      setLoading(false);
    }
  }, [user, isAdmin, userRole, roleLoading, navigate]);

  const fetchContractorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_platform_admin', false)
        .single();

      if (error) throw error;
      setProfile(data);
      await fetchStats(data.id);
    } catch (error) {
      console.error('Error fetching contractor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffContractorProfile = async () => {
    try {
      // Get staff record to find contractor
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('contractor_id')
        .eq('user_id', user?.id)
        .single();

      if (staffError) throw staffError;

      // Get contractor profile
      const { data: contractorData, error: contractorError } = await supabase
        .from('contractors')
        .select('*')
        .eq('id', staffData.contractor_id)
        .single();

      if (contractorError) throw contractorError;
      setProfile(contractorData);
      await fetchStats(contractorData.id);
    } catch (error) {
      console.error('Error fetching staff contractor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (contractorId: string) => {
    try {
      // Fetch job count
      const { count: jobCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('contractor_id', contractorId)
        .neq('status', 'cancelled');

      // Fetch customer count
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('contractor_id', contractorId);

      // Fetch staff count
      const { count: staffCount } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true })
        .eq('contractor_id', contractorId)
        .eq('is_active', true);

      setStats({
        jobs: jobCount || 0,
        customers: customerCount || 0,
        staff: staffCount || 0,
        revenue: 0 // TODO: Calculate from invoices
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile && userRole !== null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Account Setup Required</CardTitle>
            <CardDescription>
              Your account needs to be properly configured. Please contact support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userRole === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Not Configured</CardTitle>
            <CardDescription>
              Your account doesn't have the necessary permissions. Please contact your administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                If you're a contractor customer, please ensure your subscription is active.
                If you're a staff member, please contact your contractor to ensure your account is properly set up.
              </p>
              <Button onClick={() => navigate('/auth')} className="w-full">
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.contact_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {userRole === 'contractor' ? 
            `Manage your business with ${profile?.company_name}` :
            `Working for ${profile?.company_name}`
          }
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.jobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.jobs === 0 ? 'No active jobs yet' : 'jobs in progress'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.customers === 0 ? 'No customers yet' : 'total customers'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.staff}</div>
            <p className="text-xs text-muted-foreground">
              of {profile?.staff_limit} allowed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Section - Only for contractor customers */}
      {userRole === 'contractor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Complete these steps to set up your contractor business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Add your first customer</span>
                <Button size="sm" variant="outline" onClick={() => navigate('/customers')}>
                  Add Customer
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Create your first job</span>
                <Button size="sm" variant="outline" onClick={() => navigate('/jobs')}>
                  Create Job
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Invite staff members</span>
                <Button size="sm" variant="outline" onClick={() => navigate('/staff')}>
                  Manage Staff
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest business activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activity</p>
                <p className="text-sm">Activity will appear here as you use the system</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
