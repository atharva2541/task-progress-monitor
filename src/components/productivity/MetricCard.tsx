
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, BarChart3, Calendar, LineChart, Users } from 'lucide-react';

export function MetricCard({ 
  title, 
  value,
  description, 
  trend = 0, 
  trendLabel = '',
  icon = "chart-bar"
}) {
  const renderIcon = () => {
    switch (icon) {
      case 'chart-bar':
        return <BarChart3 className="h-4 w-4" />;
      case 'chart-line':
        return <LineChart className="h-4 w-4" />;
      case 'calendar':
        return <Calendar className="h-4 w-4" />;
      case 'users':
        return <Users className="h-4 w-4" />;
      case 'arrow-up':
        return <ArrowUp className="h-4 w-4" />;
      case 'arrow-down':
        return <ArrowDown className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-1 bg-primary/10 rounded-md text-primary">
          {renderIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            <span className={trend >= 0 ? "text-green-500" : "text-red-500"}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">{trendLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
