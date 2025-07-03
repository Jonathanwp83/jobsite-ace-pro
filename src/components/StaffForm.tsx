
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Staff } from '@/types/staff';

interface StaffFormProps {
  staff?: Staff;
  onSuccess: () => void;
  onCancel: () => void;
}

export const StaffForm = ({ staff, onSuccess, onCancel }: StaffFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: staff?.first_name || '',
    last_name: staff?.last_name || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    hourly_rate: staff?.hourly_rate || 0,
    is_active: staff?.is_active ?? true,
    can_view_jobs: staff?.permissions.can_view_jobs ?? true,
    can_edit_jobs: staff?.permissions.can_edit_jobs ?? false,
  });

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

      if (!contractor) throw new Error('Contractor not found');

      const staffData = {
        contractor_id: contractor.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || null,
        hourly_rate: formData.hourly_rate || null,
        is_active: formData.is_active,
        permissions: {
          can_view_jobs: formData.can_view_jobs,
          can_edit_jobs: formData.can_edit_jobs,
        },
      };

      let error;
      if (staff) {
        ({ error } = await supabase
          .from('staff')
          .update(staffData)
          .eq('id', staff.id));
      } else {
        ({ error } = await supabase
          .from('staff')
          .insert([staffData]));
      }

      if (error) throw error;

      toast({
        title: staff ? 'Staff updated successfully' : 'Staff added successfully',
      });
      onSuccess();
    } catch (error) {
      console.error('Error saving staff:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save staff member',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{staff ? 'Edit Staff Member' : 'Add Staff Member'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
            <Input
              id="hourly_rate"
              type="number"
              step="0.01"
              value={formData.hourly_rate}
              onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="can_view_jobs"
                checked={formData.can_view_jobs}
                onCheckedChange={(checked) => setFormData({ ...formData, can_view_jobs: checked })}
              />
              <Label htmlFor="can_view_jobs">Can view jobs</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="can_edit_jobs"
                checked={formData.can_edit_jobs}
                onCheckedChange={(checked) => setFormData({ ...formData, can_edit_jobs: checked })}
              />
              <Label htmlFor="can_edit_jobs">Can edit jobs</Label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (staff ? 'Update Staff' : 'Add Staff')}
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
