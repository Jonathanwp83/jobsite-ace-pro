import { InvoiceTemplate } from '@/types/template';

interface TemplatePreviewProps {
  template: InvoiceTemplate;
  branding?: {
    logo_url?: string;
    colors?: { primary: string; secondary: string };
    font_family?: string;
    font_size?: number;
    font_weight?: string;
  };
  sampleData?: {
    company_name?: string;
    contact_name?: string;
    invoice_number?: string;
  };
}

export const TemplatePreview = ({ template, branding, sampleData }: TemplatePreviewProps) => {
  const previewStyle = {
    fontFamily: branding?.font_family || 'Inter',
    fontSize: `${branding?.font_size || 14}px`,
    fontWeight: branding?.font_weight || '400',
    '--primary-color': branding?.colors?.primary || '#3b82f6',
    '--secondary-color': branding?.colors?.secondary || '#64748b',
  } as React.CSSProperties;

  // Create a mock invoice data for preview
  const mockData = {
    company_logo: branding?.logo_url || '/placeholder.svg',
    company_name: sampleData?.company_name || 'Your Company Name',
    company_address: '123 Business Street\nCity, Province A1B 2C3',
    company_phone: '(555) 123-4567',
    company_email: 'info@yourcompany.com',
    invoice_number: sampleData?.invoice_number || 'INV-1001',
    invoice_date: new Date().toLocaleDateString(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    customer_name: 'Sample Customer Ltd.',
    customer_address: '456 Client Avenue\nCustomer City, Province X1Y 2Z3',
    line_items: `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Service 1</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">10</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$50.00</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$500.00</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Service 2</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">5</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$75.00</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$375.00</td>
      </tr>
    `,
    subtotal: '$875.00',
    tax_rate: '13%',
    tax_amount: '$113.75',
    total: '$988.75',
    notes: 'Thank you for your business! Payment is due within 30 days.'
  };

  // Replace template variables with mock data
  let previewHTML = template.html_template;
  Object.entries(mockData).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    previewHTML = previewHTML.replace(regex, value);
  });

  // Combine CSS styles
  const combinedStyles = `
    <style>
      ${template.css_styles || ''}
      .preview-container {
        font-family: ${branding?.font_family || 'Inter'};
        font-size: ${branding?.font_size || 14}px;
        font-weight: ${branding?.font_weight || '400'};
      }
      .preview-container * {
        font-family: inherit !important;
        font-size: inherit !important;
        font-weight: inherit !important;
      }
      .primary-color { color: ${branding?.colors?.primary || '#3b82f6'} !important; }
      .secondary-color { color: ${branding?.colors?.secondary || '#64748b'} !important; }
      .bg-primary { background-color: ${branding?.colors?.primary || '#3b82f6'} !important; }
      .bg-secondary { background-color: ${branding?.colors?.secondary || '#64748b'} !important; }
    </style>
  `;

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="font-medium text-sm text-gray-700">Template Preview</h3>
        <p className="text-xs text-gray-500">Live preview with your branding</p>
      </div>
      <div 
        className="preview-container p-6 max-h-96 overflow-y-auto"
        style={previewStyle}
        dangerouslySetInnerHTML={{ 
          __html: combinedStyles + '<div class="preview-container">' + previewHTML + '</div>'
        }}
      />
    </div>
  );
};