
/**
 * Calculate the number of days from the current date to the due date
 * Positive = overdue, Negative = days remaining until due, 0 = due today
 * @param dueDate The due date string in ISO format
 * @returns Number of days from due date (negative if due date is in the future)
 */
export const calculateDaysOverdue = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  
  // Reset hours to ensure we're comparing full days
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Return the number of days (positive if overdue, negative if upcoming, 0 if today)
  return diffDays;
};
