import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Quote, LineItem } from '@/types/quote';
import { InvoiceTemplateSelector } from '@/components/InvoiceTemplateSelector';

interface Customer {
  id: string;
  name: string;
}

interface QuoteFormProps {
  quote?: Quote;
  onSuccess: () => void;
  onCancel: () => void;
}

export const QuoteForm = ({ quote, onSuccess, onCancel }: QuoteFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: quote?.customer_id || '',
    title: quote?.title || '',
    description: quote?.description || '',
    valid_until: quote?.valid_until || '',
    notes: quote?.notes || '',
    tax_rate: quote?.tax_rate || 0.13,
    status: quote?.status || 'draft'
  });
  const [lineItems, setLineItems] = useState<Omit<LineItem, 'id'>[]>(
    quote?.line_items || [{ description: '', quantity: 1, unit_price: 0, total: 0 }]
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  useEffect(() => {
    fetchProfile();
    fetchCustomers();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setSelectedTemplateId(data.default_invoice_template_id || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const calculateLineTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const updateLineItem = (index: number, field: keyof Omit<LineItem, 'id'>, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total = calculateLineTotal(updated[index].quantity, updated[index].unit_price);
    }
    
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * formData.tax_rate;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const generateQuoteNumber = (prefix: string, startNumber: number) => {
    return `${prefix}-${startNumber}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { subtotal, taxAmount, total } = calculateTotals();
      const quoteNumber = quote?.quote_number || generateQuoteNumber(
        profile.quote_prefix || 'QTE',
        profile.quote_start_number || 1000
      );

      const quoteData = {
        contractor_id: profile.id,
        customer_id: formData.customer_id,
        quote_number: quoteNumber,
        title: formData.title,
        description: formData.description,
        line_items: lineItems.map((item, index) => ({ ...item, id: `${index + 1}` })),
        subtotal,
        tax_rate: formData.tax_rate,
        tax_amount: taxAmount,
        total,
        status: formData.status,
        valid_until: formData.valid_until || null,
        notes: formData.notes
      };

      if (quote) {
        const { error } = await supabase
          .from('quotes')
          .update(quoteData)
          .eq('id', quote.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('quotes')
          .insert([quoteData]);

        if (error) throw error;

        // Update quote start number
        await supabase
          .from('contractors')
          .update({ quote_start_number: (profile.quote_start_number || 1000) + 1 })
          .eq('id', profile.id);
      }

      toast({
        title: "Success",
        description: `Quote ${quote ? 'updated' : 'created'} successfully`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving quote:', error);
      toast({
        title: "Error",
        description: `Failed to ${quote ? 'update' : 'create'} quote`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{quote ? 'Edit Quote' : 'New Quote'}</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Quote'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Quote Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Select value={formData.customer_id} onValueChange={(value) => setFormData({...formData, customer_id: value})}>
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
              <div>
                <Label htmlFor="title">Quote Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Quote title"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Quote description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="valid_until">Valid Until</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({...formData, tax_rate: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Line Items</CardTitle>
              <Button type="button" variant="outline" onClick={addLineItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-5">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Input
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`unit_price-${index}`}>Unit Price</Label>
                    <Input
                      id={`unit_price-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Total</Label>
                    <div className="text-lg font-medium pt-2">${item.total.toFixed(2)}</div>
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Totals */}
            <div className="border-t pt-4 mt-6">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({(formData.tax_rate * 100).toFixed(1)}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Selection */}
        <InvoiceTemplateSelector
          selectedTemplateId={selectedTemplateId}
          onTemplateSelect={setSelectedTemplateId}
        />

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes for the quote"
              rows={3}
            />
          </CardContent>
        </Card>
      </form>
    </div>
  );
};