-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'contractor', 'staff');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Create invoice templates table
CREATE TABLE public.invoice_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    html_template TEXT NOT NULL,
    css_styles TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert 6 default invoice templates
INSERT INTO public.invoice_templates (name, description, html_template, css_styles, is_default) VALUES 
('Modern Blue', 'Clean modern template with blue accents', 
'<div class="invoice-template modern-blue">
  <header class="invoice-header">
    <div class="company-info">
      {{company_logo}}
      <h1>{{company_name}}</h1>
      <p>{{company_address}}</p>
    </div>
    <div class="invoice-details">
      <h2>INVOICE</h2>
      <p>Invoice #: {{invoice_number}}</p>
      <p>Date: {{invoice_date}}</p>
      <p>Due Date: {{due_date}}</p>
    </div>
  </header>
  <section class="customer-info">
    <h3>Bill To:</h3>
    <p>{{customer_name}}</p>
    <p>{{customer_address}}</p>
  </section>
  <table class="line-items">
    <thead>
      <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
    </thead>
    <tbody>{{line_items}}</tbody>
  </table>
  <div class="totals">
    <p>Subtotal: {{subtotal}}</p>
    <p>Tax: {{tax_amount}}</p>
    <p class="total">Total: {{total}}</p>
  </div>
</div>',
'.modern-blue { font-family: Arial, sans-serif; color: #333; } .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; } .total { font-weight: bold; font-size: 1.2em; color: #3b82f6; }',
true),

('Classic Professional', 'Traditional professional invoice template',
'<div class="invoice-template classic-professional">
  <header class="invoice-header">
    <div class="company-section">
      {{company_logo}}
      <div class="company-details">
        <h1>{{company_name}}</h1>
        <p>{{company_address}}</p>
        <p>{{company_phone}} | {{company_email}}</p>
      </div>
    </div>
    <div class="invoice-title">
      <h2>INVOICE</h2>
      <div class="invoice-meta">
        <p><strong>Invoice #:</strong> {{invoice_number}}</p>
        <p><strong>Date:</strong> {{invoice_date}}</p>
        <p><strong>Due Date:</strong> {{due_date}}</p>
      </div>
    </div>
  </header>
  <div class="billing-section">
    <div class="bill-to">
      <h3>Bill To:</h3>
      <p><strong>{{customer_name}}</strong></p>
      <p>{{customer_address}}</p>
    </div>
  </div>
  <table class="items-table">
    <thead>
      <tr><th>Description</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr>
    </thead>
    <tbody>{{line_items}}</tbody>
  </table>
  <div class="invoice-totals">
    <div class="totals-section">
      <p><span>Subtotal:</span> <span>{{subtotal}}</span></p>
      <p><span>Tax ({{tax_rate}}%):</span> <span>{{tax_amount}}</span></p>
      <p class="grand-total"><span>Total:</span> <span>{{total}}</span></p>
    </div>
  </div>
  <div class="notes">
    <p><strong>Notes:</strong> {{notes}}</p>
  </div>
</div>',
'.classic-professional { font-family: "Times New Roman", serif; color: #000; max-width: 800px; margin: 0 auto; padding: 20px; } .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; } .company-section { display: flex; align-items: center; gap: 15px; } .invoice-title h2 { font-size: 2em; margin: 0; } .billing-section { margin: 20px 0; } .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; } .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; } .items-table th { background-color: #f5f5f5; font-weight: bold; } .invoice-totals { display: flex; justify-content: flex-end; margin: 20px 0; } .totals-section { min-width: 300px; } .totals-section p { display: flex; justify-content: space-between; margin: 5px 0; padding: 5px 0; } .grand-total { border-top: 2px solid #000; font-weight: bold; font-size: 1.1em; }',
false),

('Minimalist Clean', 'Simple and clean design with minimal elements',
'<div class="invoice-template minimalist-clean">
  <div class="header-section">
    <div class="company-branding">
      {{company_logo}}
      <h1>{{company_name}}</h1>
    </div>
    <div class="invoice-info">
      <h2>Invoice</h2>
      <p>{{invoice_number}}</p>
      <p>{{invoice_date}}</p>
    </div>
  </div>
  <div class="customer-section">
    <h3>To:</h3>
    <p>{{customer_name}}</p>
    <p>{{customer_address}}</p>
  </div>
  <div class="items-section">
    <table>
      <thead>
        <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
      </thead>
      <tbody>{{line_items}}</tbody>
    </table>
  </div>
  <div class="summary-section">
    <p>Subtotal: {{subtotal}}</p>
    <p>Tax: {{tax_amount}}</p>
    <p class="final-total">Total: {{total}}</p>
  </div>
</div>',
'.minimalist-clean { font-family: "Helvetica Neue", sans-serif; color: #2c3e50; line-height: 1.6; max-width: 700px; margin: 0 auto; padding: 40px 20px; } .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; } .company-branding h1 { margin: 0; font-weight: 300; font-size: 1.8em; } .invoice-info { text-align: right; } .invoice-info h2 { margin: 0; font-weight: 300; font-size: 2em; color: #95a5a6; } .customer-section { margin: 30px 0; } .customer-section h3 { margin: 0 0 10px 0; color: #95a5a6; font-weight: 300; } .items-section table { width: 100%; border-collapse: collapse; margin: 30px 0; } .items-section th { border-bottom: 1px solid #ecf0f1; padding: 15px 0; text-align: left; font-weight: 400; color: #95a5a6; } .items-section td { padding: 15px 0; border-bottom: 1px solid #ecf0f1; } .summary-section { text-align: right; margin-top: 30px; } .summary-section p { margin: 5px 0; } .final-total { font-size: 1.2em; font-weight: 600; color: #2c3e50; border-top: 1px solid #ecf0f1; padding-top: 10px; margin-top: 10px; }',
false),

('Creative Orange', 'Bold and creative template with orange theme',
'<div class="invoice-template creative-orange">
  <div class="header-wave">
    <div class="company-info">
      {{company_logo}}
      <h1>{{company_name}}</h1>
      <p>{{company_address}}</p>
    </div>
    <div class="invoice-badge">
      <h2>INVOICE</h2>
      <p>{{invoice_number}}</p>
    </div>
  </div>
  <div class="content-area">
    <div class="client-info">
      <h3>Invoice To:</h3>
      <div class="client-details">
        <p><strong>{{customer_name}}</strong></p>
        <p>{{customer_address}}</p>
      </div>
      <div class="dates">
        <p><strong>Date:</strong> {{invoice_date}}</p>
        <p><strong>Due:</strong> {{due_date}}</p>
      </div>
    </div>
    <div class="services-table">
      <table>
        <thead>
          <tr><th>Service</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
        </thead>
        <tbody>{{line_items}}</tbody>
      </table>
    </div>
    <div class="total-section">
      <div class="total-box">
        <p>Subtotal: {{subtotal}}</p>
        <p>Tax: {{tax_amount}}</p>
        <p class="grand-total">Total: {{total}}</p>
      </div>
    </div>
  </div>
</div>',
'.creative-orange { font-family: "Poppins", sans-serif; color: #333; } .header-wave { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 30px; border-radius: 0 0 50px 50px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; } .company-info h1 { margin: 0; font-size: 1.8em; font-weight: 600; } .invoice-badge { background: rgba(255,255,255,0.2); padding: 20px; border-radius: 15px; text-align: center; } .invoice-badge h2 { margin: 0; font-size: 1.5em; } .content-area { padding: 0 30px; } .client-info { display: flex; gap: 40px; margin-bottom: 30px; } .client-details, .dates { flex: 1; } .services-table table { width: 100%; border-collapse: collapse; margin: 20px 0; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); } .services-table th { background: #ff6b35; color: white; padding: 15px; text-align: left; } .services-table td { padding: 15px; border-bottom: 1px solid #eee; } .total-section { display: flex; justify-content: flex-end; margin: 30px 0; } .total-box { background: #f8f9fa; padding: 20px; border-radius: 10px; min-width: 300px; } .grand-total { font-size: 1.3em; font-weight: 600; color: #ff6b35; border-top: 2px solid #ff6b35; padding-top: 10px; margin-top: 10px; }',
false),

('Corporate Gray', 'Professional corporate template in grayscale',
'<div class="invoice-template corporate-gray">
  <header class="invoice-header">
    <div class="header-left">
      {{company_logo}}
      <div class="company-details">
        <h1>{{company_name}}</h1>
        <div class="company-contact">
          <p>{{company_address}}</p>
          <p>{{company_phone}} | {{company_email}}</p>
        </div>
      </div>
    </div>
    <div class="header-right">
      <div class="invoice-title">
        <h2>INVOICE</h2>
      </div>
      <div class="invoice-details">
        <table>
          <tr><td>Invoice #:</td><td>{{invoice_number}}</td></tr>
          <tr><td>Date:</td><td>{{invoice_date}}</td></tr>
          <tr><td>Due Date:</td><td>{{due_date}}</td></tr>
        </table>
      </div>
    </div>
  </header>
  <section class="billing-info">
    <div class="bill-to">
      <h3>BILL TO</h3>
      <p><strong>{{customer_name}}</strong></p>
      <p>{{customer_address}}</p>
    </div>
  </section>
  <section class="invoice-items">
    <table class="items-table">
      <thead>
        <tr><th>Description</th><th>Quantity</th><th>Unit Price</th><th>Line Total</th></tr>
      </thead>
      <tbody>{{line_items}}</tbody>
    </table>
  </section>
  <section class="invoice-summary">
    <div class="summary-table">
      <table>
        <tr><td>Subtotal:</td><td>{{subtotal}}</td></tr>
        <tr><td>Tax ({{tax_rate}}%):</td><td>{{tax_amount}}</td></tr>
        <tr class="total-row"><td><strong>TOTAL:</strong></td><td><strong>{{total}}</strong></td></tr>
      </table>
    </div>
  </section>
  <footer class="invoice-footer">
    <p>{{notes}}</p>
  </footer>
</div>',
'.corporate-gray { font-family: "Arial", sans-serif; color: #2c3e50; max-width: 800px; margin: 0 auto; background: white; } .invoice-header { display: flex; justify-content: space-between; padding: 40px 0; border-bottom: 3px solid #34495e; margin-bottom: 30px; } .header-left { display: flex; align-items: center; gap: 20px; } .company-details h1 { margin: 0; color: #34495e; font-size: 1.8em; } .company-contact p { margin: 5px 0; color: #7f8c8d; font-size: 0.9em; } .header-right { text-align: right; } .invoice-title h2 { margin: 0; font-size: 2.5em; color: #34495e; font-weight: 300; } .invoice-details table { border-collapse: collapse; } .invoice-details td { padding: 5px 10px; border: none; } .invoice-details td:first-child { color: #7f8c8d; text-align: right; } .billing-info { margin: 30px 0; } .bill-to h3 { color: #34495e; margin: 0 0 15px 0; font-size: 0.9em; letter-spacing: 1px; } .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; } .items-table th { background: #ecf0f1; color: #2c3e50; padding: 15px; text-align: left; font-weight: 600; border: 1px solid #bdc3c7; } .items-table td { padding: 15px; border: 1px solid #bdc3c7; } .invoice-summary { display: flex; justify-content: flex-end; margin: 30px 0; } .summary-table table { border-collapse: collapse; min-width: 300px; } .summary-table td { padding: 10px 15px; border: none; text-align: right; } .summary-table td:first-child { text-align: left; color: #7f8c8d; } .total-row { border-top: 2px solid #34495e; } .total-row td { font-size: 1.2em; color: #34495e; padding-top: 15px; } .invoice-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #7f8c8d; font-size: 0.9em; }',
false),

('Modern Green', 'Contemporary design with green accents',
'<div class="invoice-template modern-green">
  <div class="invoice-container">
    <header class="header-section">
      <div class="company-brand">
        {{company_logo}}
        <div class="brand-text">
          <h1>{{company_name}}</h1>
          <p class="tagline">Professional Services</p>
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-number">
          <span class="label">Invoice</span>
          <span class="number">{{invoice_number}}</span>
        </div>
        <div class="date-info">
          <p><span>Date:</span> {{invoice_date}}</p>
          <p><span>Due:</span> {{due_date}}</p>
        </div>
      </div>
    </header>
    <section class="client-section">
      <div class="client-card">
        <h3>Bill To</h3>
        <div class="client-info">
          <p class="client-name">{{customer_name}}</p>
          <p class="client-address">{{customer_address}}</p>
        </div>
      </div>
    </section>
    <section class="items-section">
      <table class="modern-table">
        <thead>
          <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
        </thead>
        <tbody>{{line_items}}</tbody>
      </table>
    </section>
    <section class="totals-section">
      <div class="totals-card">
        <div class="subtotal-row">
          <span>Subtotal</span>
          <span>{{subtotal}}</span>
        </div>
        <div class="tax-row">
          <span>Tax</span>
          <span>{{tax_amount}}</span>
        </div>
        <div class="total-row">
          <span>Total</span>
          <span>{{total}}</span>
        </div>
      </div>
    </section>
    <footer class="footer-section">
      <p class="thank-you">Thank you for your business!</p>
      <p class="notes">{{notes}}</p>
    </footer>
  </div>
</div>',
'.modern-green { font-family: "Inter", sans-serif; color: #1f2937; background: #f9fafb; padding: 40px; } .invoice-container { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); } .header-section { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 40px; display: flex; justify-content: space-between; align-items: center; } .company-brand { display: flex; align-items: center; gap: 20px; } .brand-text h1 { margin: 0; font-size: 1.8em; font-weight: 700; } .tagline { margin: 5px 0 0 0; opacity: 0.9; font-size: 0.9em; } .invoice-meta { text-align: right; } .invoice-number { margin-bottom: 20px; } .label { display: block; font-size: 0.9em; opacity: 0.8; } .number { font-size: 2em; font-weight: 700; } .date-info p { margin: 5px 0; } .date-info span { opacity: 0.8; } .client-section { padding: 40px; } .client-card { background: #f3f4f6; border-radius: 12px; padding: 24px; border-left: 4px solid #10b981; } .client-card h3 { margin: 0 0 16px 0; color: #10b981; font-weight: 600; } .client-name { font-weight: 600; font-size: 1.1em; margin: 0 0 8px 0; } .client-address { margin: 0; color: #6b7280; } .items-section { padding: 0 40px; } .modern-table { width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; } .modern-table th { background: #f9fafb; color: #374151; padding: 16px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; } .modern-table td { padding: 16px; border-bottom: 1px solid #f3f4f6; } .modern-table tbody tr:hover { background: #f9fafb; } .totals-section { padding: 40px; display: flex; justify-content: flex-end; } .totals-card { background: #f9fafb; border-radius: 12px; padding: 24px; min-width: 300px; } .subtotal-row, .tax-row, .total-row { display: flex; justify-content: space-between; margin: 12px 0; } .total-row { border-top: 2px solid #10b981; padding-top: 12px; font-weight: 700; font-size: 1.2em; color: #10b981; } .footer-section { padding: 40px; text-align: center; background: #f9fafb; } .thank-you { font-weight: 600; color: #10b981; margin: 0 0 16px 0; font-size: 1.1em; } .notes { margin: 0; color: #6b7280; }',
false);

-- Add contractor settings table for branding and numbering
ALTER TABLE public.contractors ADD COLUMN IF NOT EXISTS invoice_prefix TEXT DEFAULT 'INV';
ALTER TABLE public.contractors ADD COLUMN IF NOT EXISTS invoice_start_number INTEGER DEFAULT 1000;
ALTER TABLE public.contractors ADD COLUMN IF NOT EXISTS quote_prefix TEXT DEFAULT 'QTE';
ALTER TABLE public.contractors ADD COLUMN IF NOT EXISTS quote_start_number INTEGER DEFAULT 1000;
ALTER TABLE public.contractors ADD COLUMN IF NOT EXISTS default_invoice_template_id UUID REFERENCES public.invoice_templates(id);

-- Create chats table for admin to see homepage chatbot messages
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_email TEXT,
    visitor_name TEXT,
    message TEXT NOT NULL,
    response TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on chats (admins only)
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for invoice_templates (public read, admin write)
ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view invoice templates" ON public.invoice_templates
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage invoice templates" ON public.invoice_templates
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for chats (admins only)
CREATE POLICY "Admins can manage chats" ON public.chats
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update contractors RLS policy to include admin access
DROP POLICY IF EXISTS "Contractors can view own data" ON public.contractors;
CREATE POLICY "Contractors can view own data and admins can view all" ON public.contractors
FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Contractors can update own data and admins can update all" ON public.contractors
FOR UPDATE
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Add trigger for updating timestamps
CREATE TRIGGER update_contractors_updated_at
    BEFORE UPDATE ON public.contractors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoice_templates_updated_at
    BEFORE UPDATE ON public.invoice_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chats_updated_at
    BEFORE UPDATE ON public.chats
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();