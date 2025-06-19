
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for user roles and task statuses
CREATE TYPE user_role AS ENUM ('admin', 'maker', 'checker1', 'checker2');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'under_review', 'completed', 'rejected');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'maker',
  roles JSONB NOT NULL DEFAULT '["maker"]',
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  status task_status DEFAULT 'pending',
  priority task_priority DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_comments table for audit trail
CREATE TABLE public.task_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_settings table
CREATE TABLE public.system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description) VALUES
('max_file_size_kb', '5120', 'number', 'Maximum file size allowed in KB'),
('allowed_file_types', '["pdf","doc","docx","txt","jpg","png","xlsx","csv"]', 'json', 'Allowed file types for upload'),
('max_files_per_task', '5', 'number', 'Maximum number of files allowed per task'),
('enable_file_uploads', 'true', 'boolean', 'Enable or disable file uploads globally');

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for tasks
CREATE POLICY "Users can view assigned or created tasks" ON public.tasks FOR SELECT USING (
  auth.uid() = assigned_to OR 
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can create tasks" ON public.tasks FOR INSERT WITH CHECK (
  auth.uid() = created_by
);

CREATE POLICY "Users can update assigned or created tasks" ON public.tasks FOR UPDATE USING (
  auth.uid() = assigned_to OR 
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for task_comments
CREATE POLICY "Users can view comments on accessible tasks" ON public.task_comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE id = task_id AND (
      assigned_to = auth.uid() OR 
      created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  )
);

CREATE POLICY "Users can create comments" ON public.task_comments FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- RLS Policies for system_settings
CREATE POLICY "Anyone can view system settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Only admins can modify system settings" ON public.system_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, roles)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'maker'),
    COALESCE(NEW.raw_user_meta_data->'roles', '["maker"]'::jsonb)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for task attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('task-attachments', 'task-attachments', true);

-- Storage policies for task attachments
CREATE POLICY "Users can upload task attachments" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'task-attachments' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view task attachments" ON storage.objects FOR SELECT USING (
  bucket_id = 'task-attachments'
);

CREATE POLICY "Users can update their task attachments" ON storage.objects FOR UPDATE USING (
  bucket_id = 'task-attachments' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their task attachments" ON storage.objects FOR DELETE USING (
  bucket_id = 'task-attachments' AND auth.uid()::text = (storage.foldername(name))[1]
);
