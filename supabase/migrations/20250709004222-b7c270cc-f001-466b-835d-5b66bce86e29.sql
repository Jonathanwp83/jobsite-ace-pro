-- First, let's create an admin role for the existing admin user
-- We'll identify admin users by the is_platform_admin flag in contractors table

INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM public.contractors 
WHERE is_platform_admin = true
AND user_id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'admin');

-- Also create a function to better identify admin users
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.contractors 
    WHERE user_id = _user_id AND is_platform_admin = true
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Update the get_user_role function to prioritize admin role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT CASE 
    WHEN public.is_platform_admin(_user_id) THEN 'admin'::app_role
    ELSE COALESCE(
      (SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1),
      'contractor'::app_role
    )
  END
$$;