export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  html_template: string;
  css_styles: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: 'company_logo', label: 'Company Logo', description: 'Company logo image' },
  { key: 'company_name', label: 'Company Name', description: 'Company name' },
  { key: 'company_address', label: 'Company Address', description: 'Company full address' },
  { key: 'company_phone', label: 'Company Phone', description: 'Company phone number' },
  { key: 'company_email', label: 'Company Email', description: 'Company email address' },
  { key: 'invoice_number', label: 'Invoice Number', description: 'Invoice number' },
  { key: 'quote_number', label: 'Quote Number', description: 'Quote number' },
  { key: 'invoice_date', label: 'Invoice Date', description: 'Invoice creation date' },
  { key: 'due_date', label: 'Due Date', description: 'Payment due date' },
  { key: 'customer_name', label: 'Customer Name', description: 'Customer name' },
  { key: 'customer_address', label: 'Customer Address', description: 'Customer full address' },
  { key: 'line_items', label: 'Line Items', description: 'Table of invoice/quote items' },
  { key: 'subtotal', label: 'Subtotal', description: 'Subtotal amount' },
  { key: 'tax_rate', label: 'Tax Rate', description: 'Tax rate percentage' },
  { key: 'tax_amount', label: 'Tax Amount', description: 'Tax amount' },
  { key: 'total', label: 'Total', description: 'Total amount' },
  { key: 'notes', label: 'Notes', description: 'Additional notes' },
];