
/**
 * Calculate the number of days a task is overdue
 * @param dueDate The due date string in ISO format
 * @returns Number of days overdue (0 if not overdue)
 */
export const calculateDaysOverdue = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  
  // Reset hours to ensure we're comparing full days
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Return 0 if not overdue, otherwise return the number of days overdue
  return diffDays > 0 ? diffDays : 0;
};
