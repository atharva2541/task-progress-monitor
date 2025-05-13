
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { TaskPriority, TaskStatus } from '@/types';

interface TaskTypeIndicatorProps {
  type: 'priority' | 'status'; 
  value: TaskPriority | TaskStatus;
}

export function TaskTypeIndicator({ type, value }: TaskTypeIndicatorProps) {
  if (type === 'status') {
    switch (value) {
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
        return <Badge variant="outline">{value}</Badge>;
    }
  }
  
  if (type === 'priority') {
    switch (value) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
      default:
        return <Badge variant="outline">{value}</Badge>;
    }
  }
  
  return null;
}
