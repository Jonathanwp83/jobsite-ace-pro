
-- Phase 1: Create Contractor Client Role System
-- Add new user role type 'client' to the database enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';

-- Create contractor_clients table for end customers like Suzanne
CREATE TABLE IF NOT EXISTS public.contractor_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(email, contractor_id)
);

-- Enable RLS on contractor_clients
ALTER TABLE public.contractor_clients ENABLE ROW LEVEL SECURITY;

-- RLS policies for contractor_clients
CREATE POLICY "Contractor clients can view own data" 
  ON public.contractor_clients 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Contractors can manage their clients" 
  ON public.contractor_clients 
  FOR ALL 
  USING (contractor_id = get_contractor_id_for_user(auth.uid()));

CREATE POLICY "Staff can manage contractor clients" 
  ON public.contractor_clients 
  FOR ALL 
  USING (contractor_id = get_contractor_id_for_staff(auth.uid()));

-- Update get_user_role function to handle the new client role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT CASE 
    WHEN public.is_platform_admin(_user_id) THEN 'admin'::app_role
    WHEN EXISTS (SELECT 1 FROM public.contractors WHERE user_id = _user_id AND is_platform_admin = false) THEN 'contractor'::app_role
    WHEN EXISTS (SELECT 1 FROM public.staff WHERE user_id = _user_id AND is_active = true) THEN 'staff'::app_role
    WHEN EXISTS (SELECT 1 FROM public.contractor_clients WHERE user_id = _user_id AND is_active = true) THEN 'client'::app_role
    ELSE COALESCE(
      (SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1),
      'contractor'::app_role
    )
  END
$function$;

-- Function to get contractor ID for clients
CREATE OR REPLACE FUNCTION public.get_contractor_id_for_client(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
BEGIN
  -- Check if user is a client and return their contractor ID
  RETURN (SELECT cc.contractor_id FROM public.contractor_clients cc WHERE cc.user_id = user_id AND cc.is_active = true);
END;
$function$;

-- Clean up existing test data first
DELETE FROM public.staff WHERE email IN (
  'john@acmeconstruction.com',
  'sarah@elitehomes.com',
  'mike@acmeconstruction.com'
);

DELETE FROM public.contractors WHERE email IN (
  'john@acmeconstruction.com',
  'sarah@elitehomes.com'
);

-- Update existing Acme Construction to ABC Plumbing Co
UPDATE public.contractors 
SET 
  company_name = 'ABC Plumbing Co.',
  contact_name = 'Bob Sanders',
  email = 'bob@abcplumbing.com'
WHERE company_name = 'Acme Construction Co.';

-- Add updated_at trigger for contractor_clients
CREATE TRIGGER update_contractor_clients_updated_at
  BEFORE UPDATE ON public.contractor_clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
