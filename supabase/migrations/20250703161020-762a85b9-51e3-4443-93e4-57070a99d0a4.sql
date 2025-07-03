
-- Create staff table with proper relationships and permissions
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  hourly_rate NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{"can_view_jobs": true, "can_edit_jobs": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for staff
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Contractors can manage their staff
CREATE POLICY "Contractors can manage their staff" 
  ON public.staff 
  FOR ALL 
  USING (contractor_id = get_contractor_id_for_user(auth.uid()));

-- Staff can view their own data
CREATE POLICY "Staff can view own data" 
  ON public.staff 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Create time entries table for time tracking
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  clock_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out_time TIMESTAMP WITH TIME ZONE,
  break_duration INTEGER DEFAULT 0, -- in minutes
  notes TEXT,
  status public.time_entry_status DEFAULT 'clocked_in',
  gps_location_in JSONB,
  gps_location_out JSONB,
  driving_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add time entry status enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public.time_entry_status AS ENUM ('clocked_in', 'clocked_out', 'break');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add RLS policies for time entries
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Contractors and staff can access their time entries
CREATE POLICY "Contractors and staff can access their time entries" 
  ON public.time_entries 
  FOR ALL 
  USING (
    contractor_id = get_contractor_id_for_user(auth.uid()) OR 
    contractor_id = get_contractor_id_for_staff(auth.uid())
  );

-- Create quotes table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  line_items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax_rate NUMERIC(5,4) DEFAULT 0.13,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'draft',
  valid_until DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for quotes
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Contractors and staff can access their quotes
CREATE POLICY "Contractors and staff can access their quotes" 
  ON public.quotes 
  FOR ALL 
  USING (
    contractor_id = get_contractor_id_for_user(auth.uid()) OR 
    contractor_id = get_contractor_id_for_staff(auth.uid())
  );

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  line_items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax_rate NUMERIC(5,4) DEFAULT 0.13,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  status public.invoice_status DEFAULT 'draft',
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add invoice status enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add RLS policies for invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Contractors and staff can access their invoices
CREATE POLICY "Contractors and staff can access their invoices" 
  ON public.invoices 
  FOR ALL 
  USING (
    contractor_id = get_contractor_id_for_user(auth.uid()) OR 
    contractor_id = get_contractor_id_for_staff(auth.uid())
  );

-- Create job media table for file uploads
CREATE TABLE public.job_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  caption TEXT,
  gps_location JSONB,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for job media
ALTER TABLE public.job_media ENABLE ROW LEVEL SECURITY;

-- Contractors and staff can access their job media
CREATE POLICY "Contractors and staff can access their job media" 
  ON public.job_media 
  FOR ALL 
  USING (
    contractor_id = get_contractor_id_for_user(auth.uid()) OR 
    contractor_id = get_contractor_id_for_staff(auth.uid())
  );
