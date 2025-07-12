
-- Step 1: Ensure contractor_clients table exists with proper structure
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
DROP POLICY IF EXISTS "Contractor clients can view own data" ON public.contractor_clients;
CREATE POLICY "Contractor clients can view own data" 
  ON public.contractor_clients 
  FOR SELECT 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Contractors can manage their clients" ON public.contractor_clients;
CREATE POLICY "Contractors can manage their clients" 
  ON public.contractor_clients 
  FOR ALL 
  USING (contractor_id = get_contractor_id_for_user(auth.uid()));

DROP POLICY IF EXISTS "Staff can manage contractor clients" ON public.contractor_clients;
CREATE POLICY "Staff can manage contractor clients" 
  ON public.contractor_clients 
  FOR ALL 
  USING (contractor_id = get_contractor_id_for_staff(auth.uid()));

-- Add updated_at trigger for contractor_clients
DROP TRIGGER IF EXISTS update_contractor_clients_updated_at ON public.contractor_clients;
CREATE TRIGGER update_contractor_clients_updated_at
  BEFORE UPDATE ON public.contractor_clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 2: Update get_user_role function to handle client role
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

-- Step 3: Clean up existing test data and ensure ABC Plumbing Co. exists
DELETE FROM public.staff WHERE email IN (
  'thomas@abcplumbing.com',
  'bob@abcplumbing.com',
  'suzanne@email.com'
);

DELETE FROM public.contractor_clients WHERE email IN (
  'thomas@abcplumbing.com',
  'bob@abcplumbing.com',
  'suzanne@email.com'
);

-- Ensure ABC Plumbing Co. contractor exists
INSERT INTO public.contractors (
  user_id,
  company_name,
  contact_name,
  email,
  subscription_plan,
  subscription_active,
  is_platform_admin
)
SELECT 
  au.id,
  'ABC Plumbing Co.',
  'Bob Sanders',
  'bob@abcplumbing.com',
  'professional',
  true,
  false
FROM auth.users au
WHERE au.email = 'bob@abcplumbing.com'
ON CONFLICT (user_id) DO UPDATE SET
  company_name = 'ABC Plumbing Co.',
  contact_name = 'Bob Sanders',
  email = 'bob@abcplumbing.com',
  subscription_plan = 'professional',
  subscription_active = true,
  is_platform_admin = false;

-- Update any existing contractor with this email to have the right details
UPDATE public.contractors 
SET 
  company_name = 'ABC Plumbing Co.',
  contact_name = 'Bob Sanders',
  subscription_plan = 'professional',
  subscription_active = true,
  is_platform_admin = false
WHERE email = 'bob@abcplumbing.com';
