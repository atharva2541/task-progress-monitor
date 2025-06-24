
-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger that calls handle_new_user() when a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing auth users who don't have profiles yet
INSERT INTO public.profiles (id, name, email, role, roles)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) as name,
  au.email,
  COALESCE((au.raw_user_meta_data->>'role')::user_role, 'maker'::user_role) as role,
  COALESCE(au.raw_user_meta_data->'roles', '["maker"]'::jsonb) as roles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Also create default notification preferences for users without them
INSERT INTO public.user_notification_preferences (user_id)
SELECT au.id
FROM auth.users au
LEFT JOIN public.user_notification_preferences unp ON au.id = unp.user_id
WHERE unp.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
