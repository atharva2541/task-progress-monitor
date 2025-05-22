
import React from 'react';
import { Task, ObservationStatus, EscalationPriority } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';

interface TaskDetailsHeaderProps {
  task: Task;
}

export const TaskDetailsHeader: React.FC<TaskDetailsHeaderProps> = ({ task }) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy');
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-100">Pending</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Submitted</Badge>;
      case 'checker1-approved':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Checker 1 Approved</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Helper to get observation status badge based on our updated ObservationStatus type
  const getObservationBadge = (status?: ObservationStatus) => {
    if (!status) return null;
    
    switch (status) {
      case 'yes': 
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Observation: Yes</Badge>;
      case 'mixed':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Observation: Mixed</Badge>;
      case 'no':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Observation: No</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="mb-6 space-y-2">
      <h1 className="text-3xl font-bold">{task.name}</h1>
      
      <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
        <span className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          Due: {formatDate(task.dueDate)}
        </span>
        
        <span className="inline-block mx-2">•</span>
        
        <span className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          Created: {formatDate(task.createdAt)}
        </span>
        
        {task.isRecurring && (
          <>
            <span className="inline-block mx-2">•</span>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
              {task.frequency.charAt(0).toUpperCase() + task.frequency.slice(1)}
            </Badge>
          </>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        {getPriorityBadge(task.priority)}
        {getStatusBadge(task.status)}
        {task.category && (
          <Badge variant="outline" className="bg-gray-100">
            {task.category}
          </Badge>
        )}
        
        {/* Observation status badge */}
        {getObservationBadge(task.observationStatus)}
        
        {/* Escalation badge if applicable - Using direct properties or escalation object */}
        {((task.isEscalated || (task.escalation && task.escalation.isEscalated)) && (
          <Badge variant="outline" className={
            (task.escalationPriority === 'critical' || task.escalationPriority === 'high' || 
             (task.escalation && (task.escalation.priority === 'critical' || task.escalation.priority === 'high')))
              ? 'bg-red-100 text-red-800 border-red-200'
              : 'bg-amber-100 text-amber-800 border-amber-200'
          }>
            Escalated: {(task.escalation?.priority || task.escalationPriority || 'medium').charAt(0).toUpperCase() + 
                       (task.escalation?.priority || task.escalationPriority || 'medium').slice(1)}
          </Badge>
        ))}
      </div>
    </div>
  );
};
