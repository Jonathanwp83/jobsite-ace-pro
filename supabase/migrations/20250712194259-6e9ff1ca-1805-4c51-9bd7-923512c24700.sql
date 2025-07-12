
-- Phase 1: Database Cleanup
-- Delete all existing test users and their associated data

-- First, delete from dependent tables
DELETE FROM public.staff WHERE email IN (
  'admin@contractorpro.com',
  'john@acmeconstruction.com', 
  'sarah@elitehomes.com',
  'mike@acmeconstruction.com'
);

DELETE FROM public.contractors WHERE email IN (
  'admin@contractorpro.com',
  'john@acmeconstruction.com',
  'sarah@elitehomes.com', 
  'mike@acmeconstruction.com'
);

-- Delete from user_roles table
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN (
    'admin@contractorpro.com',
    'john@acmeconstruction.com',
    'sarah@elitehomes.com',
    'mike@acmeconstruction.com'
  )
);

-- Note: We cannot delete from auth.users table directly via SQL
-- The test login helper will handle user creation properly

-- Phase 2: Ensure proper table structure
-- Make sure user_roles table exists and is properly configured
-- (This should already exist based on previous migrations)

-- Verify contractors table has the correct structure
ALTER TABLE public.contractors 
  ALTER COLUMN is_platform_admin SET DEFAULT false;

-- Ensure staff table has proper foreign key constraints
-- (This should already be set up correctly)

-- Phase 3: Create initial platform admin user role
-- This will be handled by the test login helper, but we ensure the structure is ready
INSERT INTO public.user_roles (user_id, role)
SELECT 
  au.id as user_id,
  'admin'::app_role as role
FROM auth.users au
WHERE au.email = 'admin@contractorpro.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = au.id AND ur.role = 'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;
