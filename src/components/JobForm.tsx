
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
}

interface Job {
  id?: string;
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
}

interface JobFormProps {
  job?: Job;
  onSuccess: () => void;
  onCancel: () => void;
}

export const JobForm = ({ job, onSuccess, onCancel }: JobFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pricingType, setPricingType] = useState<'hourly' | 'fixed'>('hourly');
  const [formData, setFormData] = useState<Job>({
    title: job?.title || '',
    description: job?.description || '',
    customer_id: job?.customer_id || '',
    address: job?.address || '',
    city: job?.city || '',
    province: job?.province || '',
    postal_code: job?.postal_code || '',
    status: job?.status || 'pending',
    estimated_hours: job?.estimated_hours || 0,
    hourly_rate: job?.hourly_rate || 0,
    fixed_price: job?.fixed_price || 0,
    start_date: job?.start_date || '',
    end_date: job?.end_date || '',
    notes: job?.notes || '',
  });

  useEffect(() => {
    fetchCustomers();
    if (job?.fixed_price && job.fixed_price > 0) {
      setPricingType('fixed');
    }
  }, [user]);

  const fetchCustomers = async () => {
    if (!user) return;

    try {
      const { data: contractor } = await supabase
        .from('contractors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!contractor) return;

      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .eq('contractor_id', contractor.id)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { data: contractor } = await supabase
        .from('contractors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!contractor) {
        throw new Error('Contractor profile not found');
      }

      const jobData = {
        ...formData,
        contractor_id: contractor.id,
        // Set pricing based on type
        hourly_rate: pricingType === 'hourly' ? formData.hourly_rate : null,
        fixed_price: pricingType === 'fixed' ? formData.fixed_price : null,
        estimated_hours: pricingType === 'hourly' ? formData.estimated_hours : null,
      };

      if (job?.id) {
        // Update existing job
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', job.id);

        if (error) throw error;
        toast({ title: 'Job updated successfully' });
      } else {
        // Create new job
        const { error } = await supabase
          .from('jobs')
          .insert(jobData);

        if (error) throw error;
        toast({ title: 'Job created successfully' });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save job',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Job, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{job ? 'Edit Job' : 'Create New Job'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="customer">Customer *</Label>
              <Select value={formData.customer_id} onValueChange={(value) => handleChange('customer_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Location</h3>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => handleChange('province', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pricing</h3>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={pricingType === 'hourly' ? 'default' : 'outline'}
                onClick={() => setPricingType('hourly')}
              >
                Hourly Rate
              </Button>
              <Button
                type="button"
                variant={pricingType === 'fixed' ? 'default' : 'outline'}
                onClick={() => setPricingType('fixed')}
              >
                Fixed Price
              </Button>
            </div>

            {pricingType === 'hourly' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => handleChange('hourly_rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="estimated_hours">Estimated Hours</Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    step="0.5"
                    value={formData.estimated_hours}
                    onChange={(e) => handleChange('estimated_hours', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="fixed_price">Fixed Price ($)</Label>
                <Input
                  id="fixed_price"
                  type="number"
                  step="0.01"
                  value={formData.fixed_price}
                  onChange={(e) => handleChange('fixed_price', parseFloat(e.target.value) || 0)}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : job ? 'Update Job' : 'Create Job'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
