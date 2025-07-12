import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface ClientProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  contractor_id: string;
  contractor: {
    company_name: string;
    contact_name: string;
  };
}

interface Invoice {
  id: string;
  invoice_number: string;
  title: string;
  total: number;
  status: string;
  due_date: string;
  created_at: string;
}

const ClientPortal = () => {
  const { user } = useAuth();
  const { userRole, isClient, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (roleLoading) return;
    
    if (!isClient) {
      navigate('/dashboard');
      return;
    }
    
    fetchClientData();
  }, [user, isClient, roleLoading, navigate]);

  const fetchClientData = async () => {
    try {
      // Get client profile using raw SQL since TypeScript types don't include contractor_clients yet
      const { data: clientData, error: clientError } = await supabase.sql`
        SELECT 
          cc.*,
          c.company_name,
          c.contact_name
        FROM public.contractor_clients cc
        JOIN public.contractors c ON cc.contractor_id = c.id
        WHERE cc.user_id = ${user?.id} AND cc.is_active = true
        LIMIT 1
      `;

      if (clientError) throw clientError;
      
      if (clientData && clientData.length > 0) {
        const client = clientData[0];
        setProfile({
          id: client.id,
          first_name: client.first_name,
          last_name: client.last_name,
          email: client.email,
          phone: client.phone || '',
          address: client.address || '',
          city: client.city || '',
          province: client.province || '',
          postal_code: client.postal_code || '',
          contractor_id: client.contractor_id,
          contractor: {
            company_name: client.company_name,
            contact_name: client.contact_name
          }
        });

        // Get client's invoices
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .select('id, invoice_number, title, total, status, due_date, created_at')
          .eq('contractor_id', client.contractor_id)
          .order('created_at', { ascending: false });

        if (invoiceError) throw invoiceError;
        setInvoices(invoiceData || []);
      }

    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Unable to load your client profile. Please contact support.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Client Portal</h1>
              <p className="text-gray-600">Welcome, {profile.first_name} {profile.last_name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Serviced by</p>
              <p className="font-semibold text-gray-900">{profile.contractor.company_name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
                {profile.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="text-sm">
                      <div>{profile.address}</div>
                      <div>{profile.city}, {profile.province} {profile.postal_code}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Invoices */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Your Invoices
                </CardTitle>
                <CardDescription>
                  View and track your invoices from {profile.contractor.company_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No invoices found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{invoice.invoice_number}</h3>
                              <Badge className={getStatusColor(invoice.status)}>
                                {invoice.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{invoice.title}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Created: {formatDate(invoice.created_at)}
                              </div>
                              {invoice.due_date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Due: {formatDate(invoice.due_date)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-lg font-semibold">
                              <DollarSign className="h-5 w-5" />
                              {formatCurrency(invoice.total)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;
