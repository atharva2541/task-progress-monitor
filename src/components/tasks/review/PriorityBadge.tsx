
import { Badge } from "@/components/ui/badge";

type PriorityBadgeProps = {
  priority: string;
};

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
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
