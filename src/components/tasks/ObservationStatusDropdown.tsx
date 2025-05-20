
import { useState } from 'react';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ObservationStatus } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface ObservationStatusDropdownProps {
  taskId: string;
  currentStatus: ObservationStatus;
}

export function ObservationStatusDropdown({ 
  taskId, 
  currentStatus 
}: ObservationStatusDropdownProps) {
  const { updateObservationStatus } = useTask();
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<ObservationStatus>(currentStatus);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ObservationStatus>(null);

  const handleStatusChange = (status: ObservationStatus) => {
    setPendingStatus(status);
    setDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (user && pendingStatus) {
      updateObservationStatus(taskId, pendingStatus, user.id);
      setSelectedStatus(pendingStatus);
      toast({
        title: "Observation status updated",
        description: `Status set to ${pendingStatus === 'yes' ? 'Yes' : 'No'}.`,
      });
    }
    setDialogOpen(false);
  };

  // Determine background style based on status
  const getStatusStyle = () => {
    if (selectedStatus === 'yes') {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (selectedStatus === 'no') {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (selectedStatus === 'mixed') {
      return 'bg-gradient-to-r from-green-100 to-red-100 text-gray-800 border-gray-200';
    }
    return '';
  };

  return (
    <>
      <Select 
        value={selectedStatus || ""}
        onValueChange={(value) => handleStatusChange(value as ObservationStatus)}
      >
        <SelectTrigger className={`w-[180px] ${getStatusStyle()}`}>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="yes">Yes</SelectItem>
          <SelectItem value="no">No</SelectItem>
        </SelectContent>
      </Select>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm observation status change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to set the observation status to {pendingStatus === 'yes' ? 'Yes' : 'No'}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>Yes, I'm sure</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
