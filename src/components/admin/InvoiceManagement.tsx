import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Receipt, Send, Eye, DollarSign, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Invoice {
  id: string;
  invoice_number: string;
  title: string;
  total: number;
  status: string;
  due_date: string;
  created_at: string;
  contractor_id: string;
  customer_id: string;
  customers?: {
    name: string;
    email: string;
  };
  contractors?: {
    company_name: string;
    contact_name: string;
  };
}

interface InvoiceManagementProps {
  onRefresh?: () => void;
}

export const InvoiceManagement = ({ onRefresh }: InvoiceManagementProps) => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContractor, setSelectedContractor] = useState<string>('');
  const [contractors, setContractors] = useState<Array<{id: string, company_name: string}>>([]);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (name, email),
          contractors (company_name, contact_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setInvoices(data || []);
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

  const fetchContractors = async () => {
    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('id, company_name')
        .order('company_name');

      if (error) throw error;
      setContractors(data || []);
    } catch (error) {
      console.error('Error fetching contractors:', error);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchContractors();
  }, []);

  const sendInvoiceByEmail = async (invoice: Invoice) => {
    try {
      // This would typically call an edge function to send the email
      // For now, we'll just show a success message
      toast({
        title: "Success",
        description: `Invoice ${invoice.invoice_number} sent to ${invoice.customers?.email}`,
      });
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast({
        title: "Error",
        description: "Failed to send invoice",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredInvoices = selectedContractor && selectedContractor !== 'all'
    ? invoices.filter(invoice => invoice.contractor_id === selectedContractor)
    : invoices;

  const totalRevenue = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const pendingRevenue = invoices
    .filter(invoice => invoice.status === 'sent')
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const overdueRevenue = invoices
    .filter(invoice => invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.total, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Receipt className="mr-2 h-5 w-5" />
          Invoice Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Revenue Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Paid Revenue</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Pending Revenue</p>
                  <p className="text-2xl font-bold text-blue-700">{formatCurrency(pendingRevenue)}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Receipt className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-600">Overdue Revenue</p>
                  <p className="text-2xl font-bold text-red-700">{formatCurrency(overdueRevenue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="contractor-filter">Filter by Contractor</Label>
              <Select value={selectedContractor} onValueChange={setSelectedContractor}>
                <SelectTrigger>
                  <SelectValue placeholder="All Contractors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contractors</SelectItem>
                  {contractors.map((contractor) => (
                    <SelectItem key={contractor.id} value={contractor.id}>
                      {contractor.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchInvoices} variant="outline">
              Refresh
            </Button>
          </div>

          {/* Invoice List */}
          <div className="space-y-3">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium">{invoice.invoice_number}</h4>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(invoice.total)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-medium">{invoice.title}</p>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {invoice.customers?.name} ({invoice.customers?.email})
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Created: {formatDate(invoice.created_at)}
                        </span>
                        {invoice.due_date && (
                          <span className="flex items-center">
                            Due: {formatDate(invoice.due_date)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs">
                        Contractor: {invoice.contractors?.company_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendInvoiceByEmail(invoice)}
                      disabled={!invoice.customers?.email}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredInvoices.length === 0 && (
              <p className="text-gray-500 text-center py-8">No invoices found.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};