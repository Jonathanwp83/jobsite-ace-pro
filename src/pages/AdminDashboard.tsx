import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, MessageSquare, CreditCard, Settings, Eye, Edit, Plus, Trash2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [isEditingContractor, setIsEditingContractor] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatResponse, setChatResponse] = useState('');
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

      fetchAdminData();
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
      fetchAdminData();
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

      fetchAdminData();
    } catch (error) {
      console.error('Error deleting contractor:', error);
      toast({
        title: "Error",
        description: "Failed to delete contractor",
        variant: "destructive",
      });
    }
  };

  const respondToChat = async () => {
    if (!selectedChat || !chatResponse.trim()) return;

    try {
      const { error } = await supabase
        .from('chats')
        .update({ 
          response: chatResponse,
          status: 'responded'
        })
        .eq('id', selectedChat.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Response sent successfully",
      });

      setChatResponse('');
      setSelectedChat(null);
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Contractor Accounts</CardTitle>
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
                  <div>
                    <h3 className="font-medium">{contractor.company_name}</h3>
                    <p className="text-sm text-gray-600">{contractor.contact_name} • {contractor.email}</p>
                    {contractor.phone && <p className="text-sm text-gray-500">{contractor.phone}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={contractor.subscription_active ? "default" : "secondary"}>
                      {contractor.subscription_plan}
                    </Badge>
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
        </Card>

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

        {/* Chat Management */}
        <Card>
          <CardHeader>
            <CardTitle>Chat Messages Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chats.map((chat) => (
                <div key={chat.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{chat.visitor_name || 'Anonymous'}</h3>
                        <Badge variant={chat.status === 'pending' ? "destructive" : "default"}>
                          {chat.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{chat.visitor_email}</p>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm font-medium text-gray-700 mb-1">Customer Message:</p>
                        <p>{chat.message}</p>
                      </div>
                      {chat.response && (
                        <div className="bg-blue-50 p-3 rounded mt-2">
                          <p className="text-sm font-medium text-blue-700 mb-1">Your Response:</p>
                          <p>{chat.response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {chat.status === 'pending' && (
                    <div className="mt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedChat(chat)}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Respond
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Respond to {chat.visitor_name || 'Anonymous'}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded">
                              <p className="text-sm font-medium mb-2">Customer Message:</p>
                              <p>{chat.message}</p>
                            </div>
                            <div>
                              <Label htmlFor="response">Your Response</Label>
                              <Textarea
                                id="response"
                                placeholder="Type your response..."
                                value={chatResponse}
                                onChange={(e) => setChatResponse(e.target.value)}
                                rows={4}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => {
                              setSelectedChat(null);
                              setChatResponse('');
                            }}>
                              Cancel
                            </Button>
                            <Button onClick={respondToChat}>
                              <Send className="mr-2 h-4 w-4" />
                              Send Response
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
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