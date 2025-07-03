import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Palette, Upload, Save, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
}

interface ContractorSettings {
  branding_colors: any;
  branding_logo_url: string;
  invoice_prefix: string;
  invoice_start_number: number;
  quote_prefix: string;
  quote_start_number: number;
  default_invoice_template_id: string;
}

export default function ContractorSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState<ContractorSettings>({
    branding_colors: { primary: '#3b82f6', secondary: '#64748b' },
    branding_logo_url: '',
    invoice_prefix: 'INV',
    invoice_start_number: 1000,
    quote_prefix: 'QTE',
    quote_start_number: 1000,
    default_invoice_template_id: ''
  });
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTemplates();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setSettings({
        branding_colors: data.branding_colors || { primary: '#3b82f6', secondary: '#64748b' },
        branding_logo_url: data.branding_logo_url || '',
        invoice_prefix: data.invoice_prefix || 'INV',
        invoice_start_number: data.invoice_start_number || 1000,
        quote_prefix: data.quote_prefix || 'QTE',
        quote_start_number: data.quote_start_number || 1000,
        default_invoice_template_id: data.default_invoice_template_id || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .select('id, name, description, is_default')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('contractors')
        .update({
          branding_colors: settings.branding_colors,
          branding_logo_url: settings.branding_logo_url,
          invoice_prefix: settings.invoice_prefix,
          invoice_start_number: settings.invoice_start_number,
          quote_prefix: settings.quote_prefix,
          quote_start_number: settings.quote_start_number,
          default_invoice_template_id: settings.default_invoice_template_id || null
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('contractor-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('contractor-logos')
        .getPublicUrl(filePath);

      setSettings(prev => ({ ...prev, branding_logo_url: publicUrl }));

      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout profile={profile}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading settings...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Branding Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <div>
              <Label htmlFor="logo-upload">Company Logo</Label>
              <div className="mt-2 flex items-center space-x-4">
                {settings.branding_logo_url && (
                  <img 
                    src={settings.branding_logo_url} 
                    alt="Logo" 
                    className="h-16 w-16 object-contain border rounded"
                  />
                )}
                <div>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="max-w-xs"
                  />
                  <p className="text-sm text-gray-500 mt-1">Upload your company logo</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Brand Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary-color">Primary Color</Label>
                <Input
                  id="primary-color"
                  type="color"
                  value={settings.branding_colors?.primary || '#3b82f6'}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    branding_colors: { ...prev.branding_colors, primary: e.target.value }
                  }))}
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <Input
                  id="secondary-color"
                  type="color"
                  value={settings.branding_colors?.secondary || '#64748b'}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    branding_colors: { ...prev.branding_colors, secondary: e.target.value }
                  }))}
                  className="h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice & Quote Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Invoice & Quote Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Default Template */}
            <div>
              <Label htmlFor="default-template">Default Invoice Template</Label>
              <Select
                value={settings.default_invoice_template_id}
                onValueChange={(value) => setSettings(prev => ({ ...prev, default_invoice_template_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} {template.is_default && '(System Default)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">This template will be used for all new invoices and quotes</p>
            </div>

            <Separator />

            {/* Numbering Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Invoice Numbering</h3>
                <div>
                  <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
                  <Input
                    id="invoice-prefix"
                    value={settings.invoice_prefix}
                    onChange={(e) => setSettings(prev => ({ ...prev, invoice_prefix: e.target.value }))}
                    placeholder="INV"
                  />
                </div>
                <div>
                  <Label htmlFor="invoice-start">Starting Number</Label>
                  <Input
                    id="invoice-start"
                    type="number"
                    value={settings.invoice_start_number}
                    onChange={(e) => setSettings(prev => ({ ...prev, invoice_start_number: parseInt(e.target.value) || 1000 }))}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Next invoice: {settings.invoice_prefix}-{settings.invoice_start_number}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Quote Numbering</h3>
                <div>
                  <Label htmlFor="quote-prefix">Quote Prefix</Label>
                  <Input
                    id="quote-prefix"
                    value={settings.quote_prefix}
                    onChange={(e) => setSettings(prev => ({ ...prev, quote_prefix: e.target.value }))}
                    placeholder="QTE"
                  />
                </div>
                <div>
                  <Label htmlFor="quote-start">Starting Number</Label>
                  <Input
                    id="quote-start"
                    type="number"
                    value={settings.quote_start_number}
                    onChange={(e) => setSettings(prev => ({ ...prev, quote_start_number: parseInt(e.target.value) || 1000 }))}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Next quote: {settings.quote_prefix}-{settings.quote_start_number}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Template Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div 
                  key={template.id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    settings.default_invoice_template_id === template.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSettings(prev => ({ ...prev, default_invoice_template_id: template.id }))}
                >
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  {template.is_default && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mt-2 inline-block">
                      System Default
                    </span>
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