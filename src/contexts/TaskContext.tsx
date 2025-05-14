
import { createContext, useContext, ReactNode } from 'react';
import { TaskServiceProps } from '@/models/TaskModel';
import { useTaskService } from '@/services/TaskService';

const TaskContext = createContext<TaskServiceProps | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const taskService = useTaskService();
  
  return (
    <TaskContext.Provider value={taskService}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}
