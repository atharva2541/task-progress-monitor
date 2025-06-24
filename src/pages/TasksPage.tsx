
import { UserTasksView } from '@/components/tasks/UserTasksView';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const TasksPage = () => {
  const { user } = useSupabaseAuth();

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground">Please log in to view your tasks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground">Manage and track your assigned tasks</p>
      </div>
      <UserTasksView 
        userId={user.id} 
        onBack={() => {}} 
      />
    </div>
  );
};

export default TasksPage;
