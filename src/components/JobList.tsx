import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Job, JobWithCustomer } from '@/types/job';

interface JobListProps {
  onAddJob: () => void;
  onEditJob: (job: Job) => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const JobList = ({ onAddJob, onEditJob }: JobListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;

    try {
      const { data: contractor } = await supabase
        .from('contractors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!contractor) return;

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          customer:customers(name)
        `)
        .eq('contractor_id', contractor.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load jobs',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      
      setJobs(prev => prev.filter(j => j.id !== jobId));
      toast({ title: 'Job deleted successfully' });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete job',
      });
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Jobs</h2>
        <Button onClick={onAddJob}>
          <Plus className="h-4 w-4 mr-2" />
          Create Job
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No jobs found</p>
            <Button onClick={onAddJob} className="mt-4">
              Create Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <Badge className={statusColors[job.status]}>
                        {statusLabels[job.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Customer: {job.customer.name}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {(job.city || job.province) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[job.city, job.province].filter(Boolean).join(', ')}
                        </div>
                      )}
                      {job.start_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(job.start_date).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {job.fixed_price > 0 
                          ? `$${job.fixed_price.toFixed(2)} (Fixed)`
                          : `$${job.hourly_rate}/hr${job.estimated_hours ? ` × ${job.estimated_hours}h` : ''}`
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditJob(job)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {job.description && (
                <CardContent>
                  <p className="text-sm text-gray-600">{job.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
