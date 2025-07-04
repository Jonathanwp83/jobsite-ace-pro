-- Add font customization columns to contractors table
ALTER TABLE public.contractors 
ADD COLUMN invoice_font_family TEXT DEFAULT 'Inter',
ADD COLUMN invoice_font_size INTEGER DEFAULT 14,
ADD COLUMN invoice_font_weight TEXT DEFAULT '400';