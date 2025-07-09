import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Mail, Phone, MapPin, CreditCard, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  subscription_expires_at?: string;
}

interface ContractorManagementProps {
  contractors: Contractor[];
  onRefresh: () => void;
}

export const ContractorManagement = ({ contractors, onRefresh }: ContractorManagementProps) => {
  const { toast } = useToast();
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [isEditingContractor, setIsEditingContractor] = useState(false);
  const [newContractor, setNewContractor] = useState<{
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
    subscription_plan: 'starter' | 'professional' | 'enterprise';
  }>({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    subscription_plan: 'starter'
  });

  const createContractor = async () => {
    try {
      const { error } = await supabase
        .from('contractors')
        .insert([newContractor]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contractor created successfully",
      });

      setNewContractor({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        subscription_plan: 'starter'
      });

      onRefresh();
    } catch (error) {
      console.error('Error creating contractor:', error);
      toast({
        title: "Error",
        description: "Failed to create contractor",
        variant: "destructive",
      });
    }
  };

  const updateContractor = async () => {
    if (!selectedContractor) return;

    try {
      const { error } = await supabase
        .from('contractors')
        .update({
          company_name: selectedContractor.company_name,
          contact_name: selectedContractor.contact_name,
          email: selectedContractor.email,
          phone: selectedContractor.phone,
          address: selectedContractor.address,
          city: selectedContractor.city,
          province: selectedContractor.province,
          postal_code: selectedContractor.postal_code,
          subscription_plan: selectedContractor.subscription_plan,
          subscription_active: selectedContractor.subscription_active
        })
        .eq('id', selectedContractor.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contractor updated successfully",
      });

      setIsEditingContractor(false);
      setSelectedContractor(null);
      onRefresh();
    } catch (error) {
      console.error('Error updating contractor:', error);
      toast({
        title: "Error",
        description: "Failed to update contractor",
        variant: "destructive",
      });
    }
  };

  const deleteContractor = async (contractorId: string) => {
    try {
      const { error } = await supabase
        .from('contractors')
        .delete()
        .eq('id', contractorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contractor deleted successfully",
      });

      onRefresh();
    } catch (error) {
      console.error('Error deleting contractor:', error);
      toast({
        title: "Error",
        description: "Failed to delete contractor",
        variant: "destructive",
      });
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Contractor Management</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Contractor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Contractor</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={newContractor.company_name}
                  onChange={(e) => setNewContractor(prev => ({ ...prev, company_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  value={newContractor.contact_name}
                  onChange={(e) => setNewContractor(prev => ({ ...prev, contact_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newContractor.email}
                  onChange={(e) => setNewContractor(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newContractor.phone}
                  onChange={(e) => setNewContractor(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newContractor.address}
                  onChange={(e) => setNewContractor(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={newContractor.city}
                  onChange={(e) => setNewContractor(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  value={newContractor.province}
                  onChange={(e) => setNewContractor(prev => ({ ...prev, province: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={newContractor.postal_code}
                  onChange={(e) => setNewContractor(prev => ({ ...prev, postal_code: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="subscription_plan">Subscription Plan</Label>
                <Select
                  value={newContractor.subscription_plan}
                  onValueChange={(value: 'starter' | 'professional' | 'enterprise') => 
                    setNewContractor(prev => ({ ...prev, subscription_plan: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setNewContractor({
                company_name: '',
                contact_name: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                province: '',
                postal_code: '',
                subscription_plan: 'starter'
              })}>
                Cancel
              </Button>
              <Button onClick={createContractor}>Create Contractor</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contractors.map((contractor) => (
            <div key={contractor.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-medium text-lg">{contractor.company_name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <span className="font-medium">{contractor.contact_name}</span>
                      </span>
                      {contractor.email && (
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {contractor.email}
                        </span>
                      )}
                      {contractor.phone && (
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {contractor.phone}
                        </span>
                      )}
                    </div>
                    {(contractor.city || contractor.province) && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{[contractor.city, contractor.province].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant={contractor.subscription_active ? "default" : "secondary"} className={getPlanColor(contractor.subscription_plan)}>
                        <CreditCard className="h-3 w-3 mr-1" />
                        {contractor.subscription_plan.charAt(0).toUpperCase() + contractor.subscription_plan.slice(1)}
                      </Badge>
                      <span className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        Joined {formatDate(contractor.created_at)}
                      </span>
                      {contractor.subscription_expires_at && (
                        <span className="flex items-center text-xs text-gray-500">
                          Expires {formatDate(contractor.subscription_expires_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedContractor(contractor);
                    setIsEditingContractor(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Contractor</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {contractor.company_name}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteContractor(contractor.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Edit Contractor Dialog */}
      <Dialog open={isEditingContractor} onOpenChange={setIsEditingContractor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Contractor</DialogTitle>
          </DialogHeader>
          {selectedContractor && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_company_name">Company Name</Label>
                <Input
                  id="edit_company_name"
                  value={selectedContractor.company_name}
                  onChange={(e) => setSelectedContractor(prev => prev ? ({ ...prev, company_name: e.target.value }) : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit_contact_name">Contact Name</Label>
                <Input
                  id="edit_contact_name"
                  value={selectedContractor.contact_name}
                  onChange={(e) => setSelectedContractor(prev => prev ? ({ ...prev, contact_name: e.target.value }) : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={selectedContractor.email}
                  onChange={(e) => setSelectedContractor(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit_phone">Phone</Label>
                <Input
                  id="edit_phone"
                  value={selectedContractor.phone || ''}
                  onChange={(e) => setSelectedContractor(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit_address">Address</Label>
                <Input
                  id="edit_address"
                  value={selectedContractor.address || ''}
                  onChange={(e) => setSelectedContractor(prev => prev ? ({ ...prev, address: e.target.value }) : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit_city">City</Label>
                <Input
                  id="edit_city"
                  value={selectedContractor.city || ''}
                  onChange={(e) => setSelectedContractor(prev => prev ? ({ ...prev, city: e.target.value }) : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit_province">Province</Label>
                <Input
                  id="edit_province"
                  value={selectedContractor.province || ''}
                  onChange={(e) => setSelectedContractor(prev => prev ? ({ ...prev, province: e.target.value }) : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit_postal_code">Postal Code</Label>
                <Input
                  id="edit_postal_code"
                  value={selectedContractor.postal_code || ''}
                  onChange={(e) => setSelectedContractor(prev => prev ? ({ ...prev, postal_code: e.target.value }) : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit_subscription_plan">Subscription Plan</Label>
                <Select
                  value={selectedContractor.subscription_plan}
                  onValueChange={(value: 'starter' | 'professional' | 'enterprise') => 
                    setSelectedContractor(prev => prev ? ({ ...prev, subscription_plan: value }) : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditingContractor(false)}>
              Cancel
            </Button>
            <Button onClick={updateContractor}>Update Contractor</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};