
import { Task } from '@/models/TaskModel';
import { calculateDaysOverdue } from '@/utils/date-utils';
import { subMonths } from 'date-fns';

// Types for report time periods
export type ReportTimePeriod = '3months' | '6months' | '12months' | 'inception';

// Productivity metrics interface
export interface UserProductivityMetrics {
  userId: string;
  userName: string;
  tasksAssigned: number;
  tasksCompleted: number;
  tasksRejected: number;
  tasksPending: number;
  tasksOverdue: number;
  completionRate: number;
  onTimeCompletionRate: number;
  averageCompletionDays: number;
  monthlyTaskVolume: Array<{month: string, count: number}>;
}

export const useReportService = () => {
  /**
   * Filter tasks based on time period
   */
  const filterTasksByTimePeriod = (tasks: Task[], period: ReportTimePeriod): Task[] => {
    const now = new Date();
    let cutoffDate = new Date(0); // Default to start of epoch (all tasks)
    
    switch(period) {
      case '3months':
        cutoffDate = subMonths(now, 3);
        break;
      case '6months':
        cutoffDate = subMonths(now, 6);
        break;
      case '12months':
        cutoffDate = subMonths(now, 12);
        break;
      case 'inception':
        // No filter - include all tasks
        break;
    }
    
    return tasks.filter(task => new Date(task.createdAt) >= cutoffDate);
  };
  
  /**
   * Get tasks for a specific user in the given time period
   */
  const getUserTasks = (tasks: Task[], userId: string, period: ReportTimePeriod): Task[] => {
    return filterTasksByTimePeriod(tasks, period)
      .filter(task => task.assignedTo === userId);
  };
  
  /**
   * Calculate user productivity metrics
   */
  const calculateUserProductivity = (
    tasks: Task[], 
    userId: string, 
    userName: string,
    period: ReportTimePeriod
  ): UserProductivityMetrics => {
    const userTasks = getUserTasks(tasks, userId, period);
    
    const tasksAssigned = userTasks.length;
    const tasksCompleted = userTasks.filter(task => task.status === 'approved').length;
    const tasksRejected = userTasks.filter(task => task.status === 'rejected').length;
    const tasksPending = userTasks.filter(task => 
      task.status === 'pending' || 
      task.status === 'in-progress' || 
      task.status === 'submitted'
    ).length;
    
    const tasksOverdue = userTasks.filter(task => {
      return calculateDaysOverdue(task.dueDate) > 0 && 
        (task.status === 'pending' || task.status === 'in-progress');
    }).length;
    
    // Tasks completed on time (not overdue when completed)
    const tasksCompletedOnTime = userTasks.filter(task => {
      if (task.status !== 'approved') return false;
      
      const completedDate = task.updatedAt ? new Date(task.updatedAt) : new Date();
      const dueDate = new Date(task.dueDate);
      
      return completedDate <= dueDate;
    }).length;
    
    // Calculate completion times in days
    const completionTimes = userTasks
      .filter(task => task.status === 'approved')
      .map(task => {
        const startDate = new Date(task.createdAt);
        const endDate = task.updatedAt ? new Date(task.updatedAt) : new Date();
        return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      });
    
    // Calculate monthly task volumes (last 12 months regardless of period)
    const monthlyData: Array<{month: string, count: number}> = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Get last 12 months
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      const count = userTasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.getMonth() === date.getMonth() && 
               taskDate.getFullYear() === date.getFullYear();
      }).length;
      
      // Add to beginning to have oldest month first
      monthlyData.unshift({ month: monthYear, count });
    }
    
    return {
      userId,
      userName,
      tasksAssigned,
      tasksCompleted,
      tasksRejected,
      tasksPending,
      tasksOverdue,
      completionRate: tasksAssigned > 0 ? (tasksCompleted / tasksAssigned) * 100 : 0,
      onTimeCompletionRate: tasksCompleted > 0 ? (tasksCompletedOnTime / tasksCompleted) * 100 : 0,
      averageCompletionDays: completionTimes.length > 0 
        ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
        : 0,
      monthlyTaskVolume: monthlyData
    };
  };
  
  return {
    filterTasksByTimePeriod,
    getUserTasks,
    calculateUserProductivity
  };
};
