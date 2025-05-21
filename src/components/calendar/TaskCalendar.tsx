import React, { useState, useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Task } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface TaskCalendarProps {
  tasks: Task[];
  title: string;
  description?: string;
}

export const TaskCalendar = ({ tasks, title, description }: TaskCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const navigate = useNavigate();
  
  // Get tasks for the selected date
  const selectedDateTasks = useMemo(() => {
    if (!date) return [];
    return tasks.filter(task => 
      isSameDay(new Date(task.dueDate), date)
    );
  }, [tasks, date]);

  // Generate dots for days with tasks
  const tasksPerDay = useMemo(() => {
    const map = new Map<number, Task[]>();
    
    tasks.forEach(task => {
      const taskDate = new Date(task.dueDate);
      const day = taskDate.getDate();
      const month = taskDate.getMonth();
      const year = taskDate.getFullYear();
      const dateKey = new Date(year, month, day).getTime();
      
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)?.push(task);
    });
    
    return map;
  }, [tasks]);
  
  // Function to render task indicators on calendar
  const dayContent = (day: Date) => {
    const dateKey = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
    const dayTasks = tasksPerDay.get(dateKey) || [];
    
    if (dayTasks.length === 0) return null;
    
    // Count tasks by status
    const statusCounts = dayTasks.reduce((counts: Record<string, number>, task) => {
      counts[task.status] = (counts[task.status] || 0) + 1;
      return counts;
    }, {});
    
    return (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5 pb-0.5">
        {Object.entries(statusCounts).map(([status, count], i) => (
          <div 
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              status === 'pending' ? 'bg-gray-400' :
              status === 'in-progress' ? 'bg-blue-400' :
              status === 'submitted' ? 'bg-purple-400' :
              status === 'approved' ? 'bg-green-400' :
              status === 'rejected' ? 'bg-red-400' : 'bg-gray-400'
            }`}
            title={`${count} ${status} task${count > 1 ? 's' : ''}`}
          />
        ))}
      </div>
    );
  };
  
  // Handle date selection - now only setting the date without navigation
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setDate(selectedDate);
  };
  
  // Handle double-click on a date
  const handleDateDoubleClick = () => {
    if (!date) return;
    
    // Get tasks for this date
    const dateKey = new Date(
      date.getFullYear(), 
      date.getMonth(), 
      date.getDate()
    ).getTime();
    
    const dateTasks = tasksPerDay.get(dateKey) || [];
    
    // If there's exactly one task, navigate directly
    if (dateTasks.length === 1) {
      navigate(`/tasks/${dateTasks[0].id}`);
    }
    // If there are more than one tasks, dropdown is shown automatically
    // via the selectedDateTasks in the UI
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-100">Pending</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Submitted</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Navigate to a specific task
  const navigateToTask = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };
  
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h2 className="text-3xl font-bold">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="p-3 pointer-events-auto"
              components={{
                DayContent: ({ date }) => (
                  <div 
                    className="relative w-full h-full flex items-center justify-center"
                    onDoubleClick={handleDateDoubleClick}
                  >
                    {date.getDate()}
                    {dayContent(date)}
                  </div>
                )
              }}
            />
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardContent className="p-4">
            {date ? (
              <>
                <h3 className="text-xl font-semibold mb-4">
                  Tasks for {format(date, 'MMMM d, yyyy')}
                </h3>
                {selectedDateTasks.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{task.name}</div>
                          <div className="text-sm text-gray-500 truncate">{task.description}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(task.status)}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigateToTask(task.id)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Task selection dropdown for multiple tasks */}
                    {selectedDateTasks.length > 1 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="w-full mt-2">
                            Select Task to View <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full bg-white">
                          {selectedDateTasks.map((task) => (
                            <DropdownMenuItem 
                              key={task.id}
                              onClick={() => navigateToTask(task.id)}
                              className="cursor-pointer"
                            >
                              {task.name} - {task.status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No tasks scheduled for this day.
                  </p>
                )}
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Select a date to view tasks.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
