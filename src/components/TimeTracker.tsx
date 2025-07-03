
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TimeEntryWithDetails } from '@/types/timeEntry';
import { Staff } from '@/types/staff';

interface JobOption {
  id: string;
  title: string;
}

export const TimeTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeEntries, setTimeEntries] = useState<TimeEntryWithDetails[]>([]);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [activeEntry, setActiveEntry] = useState<TimeEntryWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const { data: contractor } = await supabase
        .from('contractors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!contractor) return;

      // Fetch jobs - only select id and title
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('contractor_id', contractor.id);

      // Fetch staff with proper type transformation
      const { data: staffData } = await supabase
        .from('staff')
        .select('*')
        .eq('contractor_id', contractor.id)
        .eq('is_active', true);

      // Fetch time entries
      const { data: entriesData } = await supabase
        .from('time_entries')
        .select(`
          *,
          staff:staff_id(first_name, last_name),
          job:job_id(title)
        `)
        .eq('contractor_id', contractor.id)
        .order('clock_in_time', { ascending: false })
        .limit(10);

      setJobs(jobsData || []);
      
      // Transform staff data to match our Staff type
      const transformedStaff: Staff[] = (staffData || []).map(item => ({
        ...item,
        permissions: typeof item.permissions === 'object' && item.permissions !== null 
          ? item.permissions as { can_view_jobs: boolean; can_edit_jobs: boolean }
          : { can_view_jobs: true, can_edit_jobs: false }
      }));
      setStaff(transformedStaff);
      
      setTimeEntries(entriesData || []);
      
      // Find active entry
      const active = entriesData?.find(entry => entry.status === 'clocked_in');
      setActiveEntry(active || null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    if (!selectedJobId || !selectedStaffId || !user) return;

    try {
      const { data: contractor } = await supabase
        .from('contractors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!contractor) return;

      const { data, error } = await supabase
        .from('time_entries')
        .insert([{
          contractor_id: contractor.id,
          staff_id: selectedStaffId,
          job_id: selectedJobId,
          clock_in_time: new Date().toISOString(),
          status: 'clocked_in'
        }])
        .select(`
          *,
          staff:staff_id(first_name, last_name),
          job:job_id(title)
        `)
        .single();

      if (error) throw error;

      setActiveEntry(data);
      setTimeEntries(prev => [data, ...prev]);
      toast({ title: 'Clocked in successfully' });
    } catch (error) {
      console.error('Error clocking in:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to clock in',
      });
    }
  };

  const handleClockOut = async () => {
    if (!activeEntry) return;

    try {
      const { error } = await supabase
        .from('time_entries')
        .update({
          clock_out_time: new Date().toISOString(),
          status: 'clocked_out'
        })
        .eq('id', activeEntry.id);

      if (error) throw error;

      setActiveEntry(null);
      fetchData(); // Refresh data
      toast({ title: 'Clocked out successfully' });
    } catch (error) {
      console.error('Error clocking out:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to clock out',
      });
    }
  };

  const formatDuration = (clockIn: string, clockOut?: string) => {
    const start = new Date(clockIn);
    const end = clockOut ? new Date(clockOut) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000 / 60); // minutes
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Time Tracking</h2>

      {/* Clock In/Out Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Clock
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeEntry ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-800">
                      Currently clocked in to: {activeEntry.job.title}
                    </p>
                    <p className="text-sm text-green-600">
                      Staff: {activeEntry.staff.first_name} {activeEntry.staff.last_name}
                    </p>
                    <p className="text-sm text-green-600">
                      Duration: {formatDuration(activeEntry.clock_in_time)}
                    </p>
                  </div>
                  <Button onClick={handleClockOut} variant="destructive">
                    <Square className="h-4 w-4 mr-2" />
                    Clock Out
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                onClick={handleClockIn}
                disabled={!selectedJobId || !selectedStaffId}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Clock In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {timeEntries.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No time entries found</p>
          ) : (
            <div className="space-y-3">
              {timeEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{entry.job.title}</p>
                    <p className="text-sm text-gray-600">
                      {entry.staff.first_name} {entry.staff.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.clock_in_time).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={entry.status === 'clocked_in' ? 'default' : 'secondary'}>
                      {entry.status === 'clocked_in' ? 'Active' : 'Completed'}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDuration(entry.clock_in_time, entry.clock_out_time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
