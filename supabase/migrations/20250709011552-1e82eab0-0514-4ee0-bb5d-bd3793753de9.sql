-- Step 1: Fix the admin user in the contractors table
-- First, let's identify and update the admin user
UPDATE public.contractors 
SET is_platform_admin = true 
WHERE email = 'admin@contractorpro.com';

-- Step 2: Ensure the admin user has the admin role in user_roles table
-- First, get the user_id for the admin email
INSERT INTO public.user_roles (user_id, role)
SELECT 
    au.id as user_id,
    'admin'::app_role as role
FROM auth.users au
WHERE au.email = 'admin@contractorpro.com'
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = au.id AND ur.role = 'admin'
);

-- Step 3: Also ensure any contractor marked as platform admin gets admin role
INSERT INTO public.user_roles (user_id, role)
SELECT 
    c.user_id,
    'admin'::app_role
FROM public.contractors c 
WHERE c.is_platform_admin = true
AND c.user_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = c.user_id AND ur.role = 'admin'
);

-- Step 4: Verify our admin detection function works correctly
-- This should return true for admin users
SELECT 
    c.email,
    c.is_platform_admin,
    ur.role,
    public.is_platform_admin(c.user_id) as detected_as_admin,
    public.get_user_role(c.user_id) as detected_role
FROM public.contractors c
LEFT JOIN public.user_roles ur ON ur.user_id = c.user_id
WHERE c.email = 'admin@contractorpro.com' OR c.is_platform_admin = true;