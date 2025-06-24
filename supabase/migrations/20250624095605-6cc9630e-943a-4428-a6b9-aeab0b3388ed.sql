
-- Check and add foreign key constraints that don't already exist
-- First, let's add constraints for tasks table (checking if they exist first)
DO $$
BEGIN
    -- Add tasks_created_by_fkey if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tasks_created_by_fkey' 
        AND table_name = 'tasks'
    ) THEN
        ALTER TABLE public.tasks 
        ADD CONSTRAINT tasks_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES public.profiles(id);
    END IF;

    -- Add tasks_escalated_by_fkey if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tasks_escalated_by_fkey' 
        AND table_name = 'tasks'
    ) THEN
        ALTER TABLE public.tasks 
        ADD CONSTRAINT tasks_escalated_by_fkey 
        FOREIGN KEY (escalated_by) REFERENCES public.profiles(id);
    END IF;

    -- Add task_instances foreign keys if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'task_instances_assigned_to_fkey' 
        AND table_name = 'task_instances'
    ) THEN
        ALTER TABLE public.task_instances 
        ADD CONSTRAINT task_instances_assigned_to_fkey 
        FOREIGN KEY (assigned_to) REFERENCES public.profiles(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'task_instances_checker1_fkey' 
        AND table_name = 'task_instances'
    ) THEN
        ALTER TABLE public.task_instances 
        ADD CONSTRAINT task_instances_checker1_fkey 
        FOREIGN KEY (checker1) REFERENCES public.profiles(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'task_instances_checker2_fkey' 
        AND table_name = 'task_instances'
    ) THEN
        ALTER TABLE public.task_instances 
        ADD CONSTRAINT task_instances_checker2_fkey 
        FOREIGN KEY (checker2) REFERENCES public.profiles(id);
    END IF;

    -- Add other table foreign keys if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'task_approvals_user_id_fkey' 
        AND table_name = 'task_approvals'
    ) THEN
        ALTER TABLE public.task_approvals 
        ADD CONSTRAINT task_approvals_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'task_attachments_user_id_fkey' 
        AND table_name = 'task_attachments'
    ) THEN
        ALTER TABLE public.task_attachments 
        ADD CONSTRAINT task_attachments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'task_comments_user_id_fkey' 
        AND table_name = 'task_comments'
    ) THEN
        ALTER TABLE public.task_comments 
        ADD CONSTRAINT task_comments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'activity_logs_user_id_fkey' 
        AND table_name = 'activity_logs'
    ) THEN
        ALTER TABLE public.activity_logs 
        ADD CONSTRAINT activity_logs_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_user_id_fkey' 
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE public.notifications 
        ADD CONSTRAINT notifications_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_notification_preferences_user_id_fkey' 
        AND table_name = 'user_notification_preferences'
    ) THEN
        ALTER TABLE public.user_notification_preferences 
        ADD CONSTRAINT user_notification_preferences_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;
END $$;
