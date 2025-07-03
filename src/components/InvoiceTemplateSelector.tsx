import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FileText, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InvoiceTemplate } from '@/types/template';

interface InvoiceTemplateSelectorProps {
  selectedTemplateId?: string;
  onTemplateSelect: (templateId: string) => void;
  allowPreview?: boolean;
}

export const InvoiceTemplateSelector = ({ 
  selectedTemplateId, 
  onTemplateSelect, 
  allowPreview = true 
}: InvoiceTemplateSelectorProps) => {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<InvoiceTemplate | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoice templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    onTemplateSelect(templateId);
  };

  const handlePreview = (template: InvoiceTemplate) => {
    setPreviewTemplate(template);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading templates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Invoice Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedTemplateId} onValueChange={handleTemplateSelect}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="relative">
                  <Label
                    htmlFor={`template-${template.id}`}
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplateId === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem 
                        value={template.id} 
                        id={`template-${template.id}`}
                      />
                      <span className="font-medium">{template.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <div className="flex items-center justify-between">
                      {template.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                      {allowPreview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePreview(template);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Template Preview: {previewTemplate.name}</CardTitle>
              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-white">
              {/* Simple preview of template structure */}
              <div 
                className="template-preview"
                dangerouslySetInnerHTML={{ 
                  __html: previewTemplate.html_template
                    .replace(/{{company_name}}/g, 'Sample Company')
                    .replace(/{{company_address}}/g, '123 Main St, City, State 12345')
                    .replace(/{{invoice_number}}/g, 'INV-1001')
                    .replace(/{{invoice_date}}/g, new Date().toLocaleDateString())
                    .replace(/{{due_date}}/g, new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString())
                    .replace(/{{customer_name}}/g, 'Sample Customer')
                    .replace(/{{customer_address}}/g, '456 Oak Ave, City, State 67890')
                    .replace(/{{line_items}}/g, '<tr><td>Sample Service</td><td>1</td><td>$100.00</td><td>$100.00</td></tr>')
                    .replace(/{{subtotal}}/g, '$100.00')
                    .replace(/{{tax_amount}}/g, '$13.00')
                    .replace(/{{total}}/g, '$113.00')
                    .replace(/{{notes}}/g, 'Thank you for your business!')
                }}
              />
              <style dangerouslySetInnerHTML={{ __html: previewTemplate.css_styles }} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};