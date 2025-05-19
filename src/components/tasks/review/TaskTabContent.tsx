
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { TaskTable } from './TaskTable';

type TaskTabContentProps = {
  title: string;
  description: string;
  tasks: any[];
};

export const TaskTabContent = ({ title, description, tasks }: TaskTabContentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <TaskTable tasks={tasks} />
      </CardContent>
    </Card>
  );
};
