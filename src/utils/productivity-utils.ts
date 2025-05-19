
import { format, subMonths, isAfter, parseISO, differenceInDays } from 'date-fns';

// Get filtered tasks based on time range
export function getFilteredTasksByTimeRange(tasks, timeRange) {
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case '3months':
      startDate = subMonths(now, 3);
      break;
    case '6months':
      startDate = subMonths(now, 6);
      break;
    case '12months':
      startDate = subMonths(now, 12);
      break;
    case 'alltime':
    default:
      // Return all tasks for 'alltime'
      return tasks;
  }
  
  return tasks.filter(task => {
    const taskDate = parseISO(task.createdAt);
    return isAfter(taskDate, startDate);
  });
}

// Calculate overall productivity metrics
export function calculateProductivityMetrics(tasks, users, timeRange) {
  const filteredTasks = getFilteredTasksByTimeRange(tasks, timeRange);
  
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => 
    task.status === 'approved' || task.status === 'checker1-approved'
  ).length;
  
  const tasksWithDeadline = filteredTasks.filter(task => task.dueDate && task.submittedAt);
  const onTimeTasks = tasksWithDeadline.filter(task => {
    return new Date(task.submittedAt) <= new Date(task.dueDate);
  }).length;
  
  const rejectedTasks = filteredTasks.filter(task => task.status === 'rejected').length;
  const escalatedTasks = filteredTasks.filter(task => task.escalation?.isEscalated).length;
  
  const avgCompletionTime = calculateAverageCompletionTime(filteredTasks);
  
  return {
    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    onTimeRate: tasksWithDeadline.length > 0 ? (onTimeTasks / tasksWithDeadline.length) * 100 : 0,
    avgCompletionTime,
    rejectionRate: totalTasks > 0 ? (rejectedTasks / totalTasks) * 100 : 0,
    escalationRate: totalTasks > 0 ? (escalatedTasks / totalTasks) * 100 : 0,
    totalTasks
  };
}

// Calculate average completion time in days
function calculateAverageCompletionTime(tasks) {
  const tasksWithSubmission = tasks.filter(task => task.submittedAt && task.createdAt);
  
  if (tasksWithSubmission.length === 0) return 0;
  
  const totalDays = tasksWithSubmission.reduce((sum, task) => {
    const createdDate = parseISO(task.createdAt);
    const submittedDate = parseISO(task.submittedAt);
    const days = differenceInDays(submittedDate, createdDate);
    return sum + (days > 0 ? days : 0);
  }, 0);
  
  return totalDays / tasksWithSubmission.length;
}

// Generate productivity trend data for charts
export function generateProductivityTrendData(tasks, timeRange) {
  const filteredTasks = getFilteredTasksByTimeRange(tasks, timeRange);
  
  // Group tasks by month for trend data
  const tasksByMonth = {};
  
  filteredTasks.forEach(task => {
    const date = parseISO(task.createdAt);
    const monthKey = format(date, 'MMM yyyy');
    
    if (!tasksByMonth[monthKey]) {
      tasksByMonth[monthKey] = {
        total: 0,
        completed: 0,
        onTime: 0,
        rejected: 0
      };
    }
    
    tasksByMonth[monthKey].total++;
    
    if (task.status === 'approved' || task.status === 'checker1-approved') {
      tasksByMonth[monthKey].completed++;
    }
    
    if (task.submittedAt && task.dueDate && new Date(task.submittedAt) <= new Date(task.dueDate)) {
      tasksByMonth[monthKey].onTime++;
    }
    
    if (task.status === 'rejected') {
      tasksByMonth[monthKey].rejected++;
    }
  });
  
  // Convert to array format for charts
  return Object.keys(tasksByMonth).map(month => {
    const monthData = tasksByMonth[month];
    return {
      date: month,
      completion: monthData.total > 0 ? (monthData.completed / monthData.total) * 100 : 0,
      onTime: monthData.total > 0 ? (monthData.onTime / monthData.total) * 100 : 0,
      rejection: monthData.total > 0 ? (monthData.rejected / monthData.total) * 100 : 0
    };
  });
}

// Get user-specific productivity data
export function getUserProductivityData(tasks, userId, timeRange) {
  const filteredTasks = getFilteredTasksByTimeRange(tasks, timeRange);
  const userTasks = filteredTasks.filter(task => task.assignedTo === userId);
  
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter(task => 
    task.status === 'approved' || task.status === 'checker1-approved'
  ).length;
  
  const tasksWithDeadline = userTasks.filter(task => task.dueDate && task.submittedAt);
  const onTimeTasks = tasksWithDeadline.filter(task => {
    return new Date(task.submittedAt) <= new Date(task.dueDate);
  }).length;
  
  const rejectedTasks = userTasks.filter(task => task.status === 'rejected').length;
  const escalatedTasks = userTasks.filter(task => task.escalation?.isEscalated).length;
  
  const avgCompletionTime = calculateAverageCompletionTime(userTasks);
  
  // Mock trend data (in a real app, this would compare with previous periods)
  const metrics = {
    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    onTimeRate: tasksWithDeadline.length > 0 ? (onTimeTasks / tasksWithDeadline.length) * 100 : 0,
    avgCompletionTime,
    rejectionRate: totalTasks > 0 ? (rejectedTasks / totalTasks) * 100 : 0,
    escalationRate: totalTasks > 0 ? (escalatedTasks / totalTasks) * 100 : 0,
    totalTasks,
    // Mock trend data - would be calculated from historical data in a real app
    completionRateTrend: 2.5,
    onTimeRateTrend: -1.2,
    avgCompletionTimeTrend: -0.5,
    rejectionRateTrend: -3.0,
    escalationRateTrend: 1.0,
    totalTasksTrend: 5
  };
  
  return {
    metrics,
    filteredTasks: userTasks
  };
}

// Generate chart data for user productivity
export function generateUserProductivityChartData(tasks, timeRange) {
  // Similar to the trend data function, but focused on a single user's data
  // Group tasks by week for a more granular view
  const tasksByWeek = {};
  
  tasks.forEach(task => {
    if (!task.createdAt) return;
    
    const date = parseISO(task.createdAt);
    const weekKey = format(date, 'MMM d');
    
    if (!tasksByWeek[weekKey]) {
      tasksByWeek[weekKey] = {
        total: 0,
        completed: 0,
        onTime: 0
      };
    }
    
    tasksByWeek[weekKey].total++;
    
    if (task.status === 'approved' || task.status === 'checker1-approved') {
      tasksByWeek[weekKey].completed++;
    }
    
    if (task.submittedAt && task.dueDate && new Date(task.submittedAt) <= new Date(task.dueDate)) {
      tasksByWeek[weekKey].onTime++;
    }
  });
  
  // Convert to array format for charts
  return Object.keys(tasksByWeek).map(week => {
    const weekData = tasksByWeek[week];
    return {
      date: week,
      completed: weekData.completed,
      onTime: weekData.onTime
    };
  });
}

// Generate team comparison data
export function generateTeamComparisonData(tasks, users, timeRange) {
  const filteredTasks = getFilteredTasksByTimeRange(tasks, timeRange);
  
  return users.map(user => {
    const userTasks = filteredTasks.filter(task => task.assignedTo === user.id);
    const totalTasks = userTasks.length;
    
    const completedTasks = userTasks.filter(task => 
      task.status === 'approved' || task.status === 'checker1-approved'
    ).length;
    
    const tasksWithDeadline = userTasks.filter(task => task.dueDate && task.submittedAt);
    const onTimeTasks = tasksWithDeadline.filter(task => {
      return new Date(task.submittedAt) <= new Date(task.dueDate);
    }).length;
    
    const rejectedTasks = userTasks.filter(task => task.status === 'rejected').length;
    const avgCompletionTime = calculateAverageCompletionTime(userTasks);
    
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      taskVolume: totalTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      onTimeRate: tasksWithDeadline.length > 0 ? (onTimeTasks / tasksWithDeadline.length) * 100 : 0,
      rejectionRate: totalTasks > 0 ? (rejectedTasks / totalTasks) * 100 : 0,
      avgCompletionTime
    };
  });
}

// Generate activity data for heatmaps
export function generateActivityHeatmapData(tasks, timeRange) {
  const filteredTasks = getFilteredTasksByTimeRange(tasks, timeRange);
  const activityData = {};
  
  // Count activities by day of week and hour
  filteredTasks.forEach(task => {
    // Use task submission date if available, otherwise use creation date
    const date = task.submittedAt ? parseISO(task.submittedAt) : parseISO(task.createdAt);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = date.getHours();
    
    const key = `${dayOfWeek}-${hour}`;
    activityData[key] = (activityData[key] || 0) + 1;
  });
  
  return activityData;
}

// Generate report preview data
export function generateReportPreviewData(tasks, users, selectedUserId, reportType, timeRange) {
  const filteredTasks = getFilteredTasksByTimeRange(tasks, timeRange);
  
  // Default return structure
  const reportData = {
    title: '',
    columns: [],
    data: []
  };
  
  switch (reportType) {
    case 'performance':
      reportData.title = 'Performance Metrics Report';
      reportData.columns = [
        { key: 'name', label: 'User' },
        { key: 'taskVolume', label: 'Tasks' },
        { key: 'completionRate', label: 'Completion Rate', format: 'percentage' },
        { key: 'onTimeRate', label: 'On-Time %', format: 'percentage' },
        { key: 'avgCompletionTime', label: 'Avg. Days', format: 'decimal' }
      ];
      
      if (selectedUserId === 'all') {
        // Report for all users
        reportData.data = generateTeamComparisonData(filteredTasks, users, timeRange);
      } else {
        // Report for specific user
        const user = users.find(u => u.id === selectedUserId);
        if (user) {
          const { metrics } = getUserProductivityData(filteredTasks, selectedUserId, timeRange);
          reportData.data = [{
            name: user.name,
            taskVolume: metrics.totalTasks,
            completionRate: metrics.completionRate,
            onTimeRate: metrics.onTimeRate,
            avgCompletionTime: metrics.avgCompletionTime
          }];
        }
      }
      break;
      
    case 'completion':
      reportData.title = 'Task Completion Report';
      reportData.columns = [
        { key: 'name', label: 'Task Name' },
        { key: 'dueDate', label: 'Due Date', format: 'date' },
        { key: 'submittedAt', label: 'Submitted', format: 'date' },
        { key: 'status', label: 'Status' },
        { key: 'assignedTo', label: 'Assigned To' }
      ];
      
      // Filter tasks by selected user if specified
      let tasksForReport = filteredTasks;
      if (selectedUserId !== 'all') {
        tasksForReport = filteredTasks.filter(task => task.assignedTo === selectedUserId);
      }
      
      reportData.data = tasksForReport.slice(0, 5).map(task => {
        const assignedUser = users.find(u => u.id === task.assignedTo);
        return {
          name: task.name,
          dueDate: task.dueDate,
          submittedAt: task.submittedAt || '-',
          status: task.status,
          assignedTo: assignedUser ? assignedUser.name : 'Unknown'
        };
      });
      break;
      
    // Add other report types here
  }
  
  return reportData;
}
