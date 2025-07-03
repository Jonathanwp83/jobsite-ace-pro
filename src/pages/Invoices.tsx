import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Receipt, Edit, Trash2, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InvoiceWithCustomer } from '@/types/invoice';

export default function Invoices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<InvoiceWithCustomer[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.id) {
      fetchInvoices();
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

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(name),
          job:jobs(title)
        `)
        .eq('contractor_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices((data as any) || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout profile={profile}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading invoices...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>

        {invoices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-gray-500 mb-4">Create your first invoice to get started.</p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{invoice.title}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Invoice #{invoice.invoice_number} • {invoice.customer.name}
                        {invoice.job && ` • ${invoice.job.title}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {invoice.status !== 'paid' && (
                          <Button variant="outline" size="sm">
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Subtotal</p>
                      <p className="font-medium">${invoice.subtotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tax</p>
                      <p className="font-medium">${invoice.tax_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-bold text-lg">${invoice.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Due Date</p>
                      <p className="font-medium">
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'No due date'}
                      </p>
                    </div>
                  </div>
                  {invoice.paid_at && (
                    <div className="mt-4 p-2 bg-green-50 rounded text-sm text-green-800">
                      Paid on {new Date(invoice.paid_at).toLocaleDateString()}
                      {invoice.payment_method && ` via ${invoice.payment_method}`}
                    </div>
                  )}
                  {invoice.description && (
                    <p className="mt-4 text-gray-600">{invoice.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}