import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QuoteWithCustomer } from '@/types/quote';

export default function Quotes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<QuoteWithCustomer[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.id) {
      fetchQuotes();
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

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customer:customers(name)
        `)
        .eq('contractor_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes((data as any) || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch quotes",
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
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout profile={profile}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading quotes...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </div>

        {quotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes yet</h3>
              <p className="text-gray-500 mb-4">Create your first quote to get started.</p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Quote
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {quotes.map((quote) => (
              <Card key={quote.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{quote.title}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Quote #{quote.quote_number} • {quote.customer.name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(quote.status || 'draft')}>
                        {quote.status || 'draft'}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
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
                      <p className="font-medium">${quote.subtotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tax</p>
                      <p className="font-medium">${quote.tax_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-bold text-lg">${quote.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Valid Until</p>
                      <p className="font-medium">
                        {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'No expiry'}
                      </p>
                    </div>
                  </div>
                  {quote.description && (
                    <p className="mt-4 text-gray-600">{quote.description}</p>
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