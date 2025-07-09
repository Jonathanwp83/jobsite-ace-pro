
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Clock, 
  FileText
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
    console.log('🔍 Dashboard useEffect:', { user: user?.email, isAdmin, userRole });
    
    if (!user) {
      console.log('❌ No user, redirecting to auth');
      navigate('/auth');
      return;
    }
    
    // Wait for role loading to complete before making routing decisions
    if (roleLoading) {
      console.log('⏳ Role still loading, waiting...');
      return;
    }
    
    // Redirect admins to admin dashboard, but only if role detection is complete
    if (isAdmin && userRole === 'admin') {
      console.log('✅ User is admin, redirecting to admin dashboard');
      navigate('/admin');
      return;
    }
    
    // Only contractors and staff should access this dashboard
    if (userRole && userRole !== 'contractor' && userRole !== 'staff') {
      console.log('❌ User role not contractor/staff, redirecting to admin');
      navigate('/admin');
      return;
    }
    
    if (userRole === 'contractor' || userRole === 'staff') {
      console.log('✅ User is contractor/staff, fetching data');
      fetchProfile();
      fetchStats();
    }
  }, [user, isAdmin, userRole, roleLoading, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      const { data: contractor } = await supabase
        .from('contractors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!contractor) return;

      // Fetch job count
      const { count: jobCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('contractor_id', contractor.id)
        .neq('status', 'cancelled');

      // Fetch customer count
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('contractor_id', contractor.id);

      // Fetch staff count
      const { count: staffCount } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true })
        .eq('contractor_id', contractor.id)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Welcome to ContractorPro</CardTitle>
            <CardDescription>
              Your account is being set up. Please refresh the page in a moment.
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

  return (
    <DashboardLayout profile={profile}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile.contact_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your contracting business with {profile.company_name}
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
              of {profile.staff_limit} allowed
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

      {/* Getting Started Section */}
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
              <Button size="sm" variant="outline" disabled>
                Coming Soon
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Set up billing information</span>
              <Button size="sm" variant="outline" disabled>
                Coming Soon
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
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity</p>
              <p className="text-sm">Activity will appear here as you use the system</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
