
-- Add RLS policies for notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to delete their own notifications
CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policy that allows authenticated users to insert notifications
CREATE POLICY "Authenticated users can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add RLS policies for user_notification_preferences table
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own preferences
CREATE POLICY "Users can view their own notification preferences" 
  ON public.user_notification_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to update their own preferences
CREATE POLICY "Users can update their own notification preferences" 
  ON public.user_notification_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own preferences
CREATE POLICY "Users can create their own notification preferences" 
  ON public.user_notification_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to trigger notifications when tasks are created/updated
CREATE OR REPLACE FUNCTION public.notify_task_events()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  assigned_user_id UUID;
  checker1_user_id UUID;
  checker2_user_id UUID;
BEGIN
  -- Set the user IDs
  assigned_user_id := COALESCE(NEW.assigned_to, OLD.assigned_to);
  checker1_user_id := COALESCE(NEW.checker1, OLD.checker1);
  checker2_user_id := COALESCE(NEW.checker2, OLD.checker2);

  -- Handle different trigger events
  IF TG_OP = 'INSERT' THEN
    -- Task created
    notification_title := 'New Task Assignment';
    notification_message := 'You have been assigned a new task: ' || NEW.name;
    
    -- Notify assigned user
    IF assigned_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (
        user_id, title, message, type, task_id, notification_type, priority
      ) VALUES (
        assigned_user_id, notification_title, notification_message, 
        'info', NEW.id, 'task_assignment', NEW.priority::text
      );
    END IF;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Task updated
    IF OLD.status != NEW.status THEN
      -- Status changed
      notification_title := 'Task Status Updated';
      notification_message := 'Task "' || NEW.name || '" status changed to ' || NEW.status;
      
      -- Notify all involved users
      IF assigned_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (
          user_id, title, message, type, task_id, notification_type, priority
        ) VALUES (
          assigned_user_id, notification_title, notification_message, 
          'info', NEW.id, 'task_updates', NEW.priority::text
        );
      END IF;
      
      IF checker1_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (
          user_id, title, message, type, task_id, notification_type, priority
        ) VALUES (
          checker1_user_id, notification_title, notification_message, 
          'info', NEW.id, 'task_updates', NEW.priority::text
        );
      END IF;
      
      IF checker2_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (
          user_id, title, message, type, task_id, notification_type, priority
        ) VALUES (
          checker2_user_id, notification_title, notification_message, 
          'info', NEW.id, 'task_updates', NEW.priority::text
        );
      END IF;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for task notifications
DROP TRIGGER IF EXISTS task_notification_trigger ON public.tasks;
CREATE TRIGGER task_notification_trigger
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_task_events();

-- Create function to send email notifications
CREATE OR REPLACE FUNCTION public.send_email_notification()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  email_enabled BOOLEAN;
  task_name TEXT;
  task_due_date TEXT;
BEGIN
  -- Get user details and email preferences
  SELECT p.email, p.name, COALESCE(unp.email_enabled, true)
  INTO user_email, user_name, email_enabled
  FROM public.profiles p
  LEFT JOIN public.user_notification_preferences unp ON p.id = unp.user_id
  WHERE p.id = NEW.user_id;
  
  -- Get task details if this is a task notification
  IF NEW.task_id IS NOT NULL THEN
    SELECT t.name, t.due_date::text
    INTO task_name, task_due_date
    FROM public.tasks t
    WHERE t.id = NEW.task_id;
  END IF;
  
  -- Send email if enabled and we have the necessary details
  IF email_enabled AND user_email IS NOT NULL THEN
    -- Call the send-email edge function
    PERFORM
      net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/send-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object(
          'to', user_email,
          'subject', NEW.title,
          'html', CASE 
            WHEN NEW.notification_type = 'task_assignment' THEN
              '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #5a3FFF;">New Task Assignment</h2>
                <p>Hello ' || user_name || ',</p>
                <p>' || NEW.message || '</p>
                <div style="background-color: #f7f7f7; padding: 15px; margin: 15px 0; border-radius: 5px;">
                  <p><strong>Task:</strong> ' || COALESCE(task_name, 'Unknown') || '</p>
                  <p><strong>Due Date:</strong> ' || COALESCE(task_due_date, 'Not set') || '</p>
                </div>
                <p>Please login to the Audit Tracker system to view and manage this task.</p>
                <p>Thank you,<br/>Audit Tracker Team</p>
              </div>'
            ELSE
              '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #5a3FFF;">Audit Tracker Notification</h2>
                <p>Hello ' || user_name || ',</p>
                <p>' || NEW.message || '</p>
                <p>Please login to the Audit Tracker system for more details.</p>
                <p>Thank you,<br/>Audit Tracker Team</p>
              </div>'
          END
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email notifications
DROP TRIGGER IF EXISTS email_notification_trigger ON public.notifications;
CREATE TRIGGER email_notification_trigger
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_email_notification();
