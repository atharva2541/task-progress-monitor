
-- Check and add foreign key constraints that don't already exist
-- First, let's add constraints for tasks table (checking if they exist first)
DO $$
BEGIN
    -- Add tasks_assigned_to_fkey if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tasks_assigned_to_fkey' 
        AND table_name = 'tasks'
    ) THEN
        ALTER TABLE public.tasks 
        ADD CONSTRAINT tasks_assigned_to_fkey 
        FOREIGN KEY (assigned_to) REFERENCES public.profiles(id);
    END IF;

    -- Add tasks_checker1_fkey if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tasks_checker1_fkey' 
        AND table_name = 'tasks'
    ) THEN
        ALTER TABLE public.tasks 
        ADD CONSTRAINT tasks_checker1_fkey 
        FOREIGN KEY (checker1) REFERENCES public.profiles(id);
    END IF;

    -- Add tasks_checker2_fkey if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tasks_checker2_fkey' 
        AND table_name = 'tasks'
    ) THEN
        ALTER TABLE public.tasks 
        ADD CONSTRAINT tasks_checker2_fkey 
        FOREIGN KEY (checker2) REFERENCES public.profiles(id);
    END IF;
END $$;
