
-- First, let's make sure the profiles table has the correct structure
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'maker'::user_role,
ALTER COLUMN roles SET DEFAULT '["maker"]'::jsonb;

-- Create a more robust version of the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if profile doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, name, email, role, roles)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.email,
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'maker'::user_role),
      COALESCE(NEW.raw_user_meta_data->'roles', '["maker"]'::jsonb)
    );
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it's working
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Manually create a profile for the user that was just created (if it doesn't exist)
INSERT INTO public.profiles (id, name, email, role, roles)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  au.email,
  'admin'::user_role,
  '["admin"]'::jsonb
FROM auth.users au
WHERE au.email = 'atharva.kale@sbfc.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = au.id);
