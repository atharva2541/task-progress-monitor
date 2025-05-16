
import React from 'react';
import { Route } from 'react-router-dom';
import MyTasksPage from '../pages/tasks/MyTasksPage';
import TasksToReviewPage from '../pages/tasks/TasksToReviewPage';

export const taskRoutes = (
  <>
    <Route path="/my-tasks" element={<MyTasksPage />} />
    <Route path="/tasks-to-review" element={<TasksToReviewPage />} />
  </>
);
