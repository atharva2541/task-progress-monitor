
import { useState } from "react";
import { useTask } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";
import { UserRoleTasks } from "@/components/tasks/UserRoleTasks";

const TaskList = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tasks</h1>
      </div>
      
      <UserRoleTasks />
    </div>
  );
};

export default TaskList;
