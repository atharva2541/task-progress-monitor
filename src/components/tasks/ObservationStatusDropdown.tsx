
import { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { ObservationStatus } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface ObservationStatusDropdownProps {
  taskId: string;
  currentStatus: ObservationStatus | null;
  required?: boolean; // Added required prop
}

export const ObservationStatusDropdown = ({ 
  taskId, 
  currentStatus,
  required = false // Default to false for backward compatibility
}: ObservationStatusDropdownProps) => {
  const { updateObservationStatus } = useTask();
  const { user } = useAuth();
  const [status, setStatus] = useState<ObservationStatus | null>(currentStatus);
  
  if (!user) return null;
  
  const handleStatusChange = (value: string) => {
    const newStatus = value as ObservationStatus;
    setStatus(newStatus);
    
    updateObservationStatus(taskId, newStatus, user.id);
    
    toast({
      title: "Observation status updated",
      description: `Observation status set to "${newStatus}"`,
    });
  };
  
  return (
    <Select onValueChange={handleStatusChange} value={status || undefined}>
      <SelectTrigger className={`w-full max-w-xs ${!status && required ? 'border-red-500' : ''}`}>
        <SelectValue placeholder={`Select observation status${required ? ' (Required)' : ''}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="yes">Yes - Observations Found</SelectItem>
        <SelectItem value="no">No - No Observations Found</SelectItem>
        <SelectItem value="mixed">Mixed - Some Observations Found</SelectItem>
      </SelectContent>
    </Select>
  );
};
