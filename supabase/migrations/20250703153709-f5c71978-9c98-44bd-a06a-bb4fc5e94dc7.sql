
-- Create enums for various status types
CREATE TYPE subscription_plan AS ENUM ('starter', 'professional', 'enterprise');
CREATE TYPE job_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE time_entry_status AS ENUM ('clocked_in', 'clocked_out', 'break');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE user_role AS ENUM ('contractor', 'staff');

-- Contractors table (main account holders)
CREATE TABLE public.contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  tax_number TEXT,
  certification_numbers TEXT[],
  subscription_plan subscription_plan NOT NULL DEFAULT 'starter',
  subscription_active BOOLEAN DEFAULT true,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  staff_limit INTEGER NOT NULL DEFAULT 3,
  branding_logo_url TEXT,
  branding_colors JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Staff members table
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  hourly_rate DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{"can_view_jobs": true, "can_edit_jobs": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  status job_status DEFAULT 'pending',
  estimated_hours DECIMAL(10,2),
  hourly_rate DECIMAL(10,2),
  fixed_price DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  assigned_staff UUID[] DEFAULT '{}',
  materials_cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Time tracking table
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  clock_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out_time TIMESTAMP WITH TIME ZONE,
  break_duration INTEGER DEFAULT 0, -- in minutes
  gps_location_in JSONB, -- {lat, lng, accuracy}
  gps_location_out JSONB,
  driving_data JSONB, -- {distance, speed_violations, harsh_braking, etc}
  notes TEXT,
  status time_entry_status DEFAULT 'clocked_in',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Quotes table
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  quote_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  line_items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,4) DEFAULT 0.13, -- 13% HST default for Canada
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  valid_until DATE,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(contractor_id, quote_number)
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  line_items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,4) DEFAULT 0.13,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  due_date DATE,
  status invoice_status DEFAULT 'draft',
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(contractor_id, invoice_number)
);

-- Job photos/videos table
CREATE TABLE public.job_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image' or 'video'
  caption TEXT,
  gps_location JSONB,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_media ENABLE ROW LEVEL SECURITY;

-- Helper function to get contractor ID from user ID
CREATE OR REPLACE FUNCTION public.get_contractor_id_for_user(user_id UUID)
RETURNS UUID AS $$
BEGIN
  -- Check if user is a contractor
  RETURN (SELECT c.id FROM public.contractors c WHERE c.user_id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to get contractor ID from staff user ID
CREATE OR REPLACE FUNCTION public.get_contractor_id_for_staff(user_id UUID)
RETURNS UUID AS $$
BEGIN
  -- Check if user is staff and return their contractor ID
  RETURN (SELECT s.contractor_id FROM public.staff s WHERE s.user_id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RLS Policies for contractors table
CREATE POLICY "Contractors can view own data" ON public.contractors
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for staff table
CREATE POLICY "Contractors can manage their staff" ON public.staff
  FOR ALL USING (contractor_id = public.get_contractor_id_for_user(auth.uid()));

CREATE POLICY "Staff can view own data" ON public.staff
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for customers table
CREATE POLICY "Contractors can manage their customers" ON public.customers
  FOR ALL USING (
    contractor_id = public.get_contractor_id_for_user(auth.uid()) OR
    contractor_id = public.get_contractor_id_for_staff(auth.uid())
  );

-- RLS Policies for jobs table
CREATE POLICY "Contractors and staff can access their jobs" ON public.jobs
  FOR ALL USING (
    contractor_id = public.get_contractor_id_for_user(auth.uid()) OR
    contractor_id = public.get_contractor_id_for_staff(auth.uid())
  );

-- RLS Policies for time_entries table
CREATE POLICY "Contractors and staff can access their time entries" ON public.time_entries
  FOR ALL USING (
    contractor_id = public.get_contractor_id_for_user(auth.uid()) OR
    contractor_id = public.get_contractor_id_for_staff(auth.uid())
  );

-- RLS Policies for quotes table
CREATE POLICY "Contractors and staff can access their quotes" ON public.quotes
  FOR ALL USING (
    contractor_id = public.get_contractor_id_for_user(auth.uid()) OR
    contractor_id = public.get_contractor_id_for_staff(auth.uid())
  );

-- RLS Policies for invoices table
CREATE POLICY "Contractors and staff can access their invoices" ON public.invoices
  FOR ALL USING (
    contractor_id = public.get_contractor_id_for_user(auth.uid()) OR
    contractor_id = public.get_contractor_id_for_staff(auth.uid())
  );

-- RLS Policies for job_media table
CREATE POLICY "Contractors and staff can access their job media" ON public.job_media
  FOR ALL USING (
    contractor_id = public.get_contractor_id_for_user(auth.uid()) OR
    contractor_id = public.get_contractor_id_for_staff(auth.uid())
  );

-- Create indexes for better performance
CREATE INDEX idx_contractors_user_id ON public.contractors(user_id);
CREATE INDEX idx_staff_user_id ON public.staff(user_id);
CREATE INDEX idx_staff_contractor_id ON public.staff(contractor_id);
CREATE INDEX idx_customers_contractor_id ON public.customers(contractor_id);
CREATE INDEX idx_jobs_contractor_id ON public.jobs(contractor_id);
CREATE INDEX idx_jobs_customer_id ON public.jobs(customer_id);
CREATE INDEX idx_time_entries_contractor_id ON public.time_entries(contractor_id);
CREATE INDEX idx_time_entries_staff_id ON public.time_entries(staff_id);
CREATE INDEX idx_time_entries_job_id ON public.time_entries(job_id);
CREATE INDEX idx_quotes_contractor_id ON public.quotes(contractor_id);
CREATE INDEX idx_invoices_contractor_id ON public.invoices(contractor_id);
CREATE INDEX idx_job_media_contractor_id ON public.job_media(contractor_id);
CREATE INDEX idx_job_media_job_id ON public.job_media(job_id);

-- Trigger to automatically update contractor profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_contractor_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create contractor profile if user metadata indicates they're a contractor
  IF NEW.raw_user_meta_data ->> 'user_type' = 'contractor' THEN
    INSERT INTO public.contractors (user_id, company_name, contact_name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'My Company'),
      COALESCE(NEW.raw_user_meta_data ->> 'contact_name', SPLIT_PART(NEW.email, '@', 1)),
      NEW.email
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created_contractor
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_contractor_user();
