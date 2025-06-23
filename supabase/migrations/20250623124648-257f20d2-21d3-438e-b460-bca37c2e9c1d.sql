
-- Create the missing profile for the admin user
INSERT INTO public.profiles (id, name, email, role, roles)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', 'Admin User'),
  au.email,
  'admin'::user_role,
  '["admin"]'::jsonb
FROM auth.users au
WHERE au.email = 'atharva.kale@sbfc.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = au.id);
