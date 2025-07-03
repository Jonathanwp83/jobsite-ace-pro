import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, DollarSign, Clock, Users, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalRevenue: number;
  totalJobs: number;
  activeJobs: number;
  totalCustomers: number;
  totalStaff: number;
  totalHours: number;
  recentInvoices: number;
  unpaidInvoices: number;
}

export default function Analytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalCustomers: 0,
    totalStaff: 0,
    totalHours: 0,
    recentInvoices: 0,
    unpaidInvoices: 0,
  });
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.id) {
      fetchAnalytics();
    }
  }, [profile?.id]);

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
    }
  };

  const fetchAnalytics = async () => {
    try {
      const contractorId = profile?.id;

      // Fetch all analytics data in parallel
      const [
        jobsData,
        customersData,
        staffData,
        invoicesData,
        timeEntriesData
      ] = await Promise.all([
        supabase.from('jobs').select('*').eq('contractor_id', contractorId),
        supabase.from('customers').select('*').eq('contractor_id', contractorId),
        supabase.from('staff').select('*').eq('contractor_id', contractorId),
        supabase.from('invoices').select('*').eq('contractor_id', contractorId),
        supabase.from('time_entries').select('*').eq('contractor_id', contractorId)
      ]);

      const jobs = jobsData.data || [];
      const customers = customersData.data || [];
      const staff = staffData.data || [];
      const invoices = invoicesData.data || [];
      const timeEntries = timeEntriesData.data || [];

      // Calculate metrics
      const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + Number(inv.total), 0);

      const activeJobs = jobs.filter(job => 
        job.status === 'pending' || job.status === 'in_progress'
      ).length;

      const unpaidInvoices = invoices.filter(inv => 
        inv.status !== 'paid' && inv.status !== 'cancelled'
      ).length;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentInvoices = invoices.filter(inv => 
        new Date(inv.created_at) >= thirtyDaysAgo
      ).length;

      // Calculate total hours from time entries
      const totalHours = timeEntries.reduce((sum, entry) => {
        if (entry.clock_in_time && entry.clock_out_time) {
          const clockIn = new Date(entry.clock_in_time);
          const clockOut = new Date(entry.clock_out_time);
          const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }
        return sum;
      }, 0);

      setAnalytics({
        totalRevenue,
        totalJobs: jobs.length,
        activeJobs,
        totalCustomers: customers.length,
        totalStaff: staff.length,
        totalHours: Math.round(totalHours),
        recentInvoices,
        unpaidInvoices,
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

  if (loading) {
    return (
      <DashboardLayout profile={profile}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center">
          <BarChart3 className="mr-3 h-8 w-8" />
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From paid invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeJobs}</div>
              <p className="text-xs text-muted-foreground">Of {analytics.totalJobs} total jobs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalHours}</div>
              <p className="text-xs text-muted-foreground">Tracked time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalStaff}</div>
              <p className="text-xs text-muted-foreground">Staff members</p>
            </CardContent>
          </Card>
        </div>

        {/* Business Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Business Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Customers</span>
                <span className="font-medium">{analytics.totalCustomers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Recent Invoices (30 days)</span>
                <span className="font-medium">{analytics.recentInvoices}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unpaid Invoices</span>
                <span className="font-medium text-red-600">{analytics.unpaidInvoices}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Revenue per Job</span>
                <span className="font-medium">
                  ${analytics.totalJobs > 0 ? Math.round(analytics.totalRevenue / analytics.totalJobs).toLocaleString() : '0'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Based on your data, here are some recommendations:
              </p>
              {analytics.unpaidInvoices > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    You have {analytics.unpaidInvoices} unpaid invoice{analytics.unpaidInvoices !== 1 ? 's' : ''}. 
                    Consider following up with customers.
                  </p>
                </div>
              )}
              {analytics.activeJobs === 0 && analytics.totalJobs > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    No active jobs. Consider reaching out to customers for new opportunities.
                  </p>
                </div>
              )}
              {analytics.totalCustomers < 5 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    Growing your customer base could help increase revenue.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}