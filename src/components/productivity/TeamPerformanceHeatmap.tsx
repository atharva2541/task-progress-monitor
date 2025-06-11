
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateActivityHeatmapData } from '@/utils/productivity-utils';

// Define the type for our activity data
type ActivityData = {
  [key: string]: number;
};

export function TeamPerformanceHeatmap({ tasks, timeRange }: { tasks: any; timeRange: any }) {
  const [activityData, setActivityData] = useState<ActivityData>({});

  useEffect(() => {
    // Generate heatmap data based on tasks and timeRange
    const heatmapData = generateActivityHeatmapData(tasks, timeRange);
    setActivityData(heatmapData);
  }, [tasks, timeRange]);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hourLabels = Array.from({ length: 24 }, (_, i) => 
    i === 0 ? '12am' : i === 12 ? '12pm' : i > 12 ? `${i-12}pm` : `${i}am`
  );
  
  // Find the max activity count for color scale
  const maxActivity = Object.values(activityData).reduce((max, val) => Math.max(max, val), 0);
  
  // Get color intensity based on activity level
  const getColorIntensity = (count: number) => {
    if (!count) return 'bg-gray-100';
    const intensity = Math.min(0.9, (count / maxActivity) * 0.8 + 0.1);
    return `rgb(79, 70, 229, ${intensity})`;
  };
  
  // Render the heatmap cells
  const renderHeatmap = () => {
    return (
      <div className="grid grid-cols-[auto,1fr] gap-2">
        <div></div>
        <div className="grid grid-cols-24 gap-1">
          {hourLabels.map((hour, i) => (
            i % 3 === 0 && (
              <div key={i} className="text-[10px] text-muted-foreground text-center">
                {hour}
              </div>
            )
          ))}
        </div>
        
        {dayLabels.map((day, dayIndex) => (
          <React.Fragment key={dayIndex}>
            <div className="flex items-center pr-2 text-xs text-muted-foreground">
              {day}
            </div>
            <div className="grid grid-cols-24 gap-1">
              {Array.from({ length: 24 }, (_, hourIndex) => {
                const key = `${dayIndex}-${hourIndex}`;
                const activityCount = activityData[key] || 0;
                const style = { backgroundColor: getColorIntensity(activityCount) };
                
                return (
                  <div 
                    key={hourIndex}
                    className="h-3 w-full rounded-sm hover:opacity-80 cursor-pointer"
                    style={style}
                    title={`${day} ${hourLabels[hourIndex]}: ${activityCount} tasks`}
                  />
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Activity Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {maxActivity > 0 ? renderHeatmap() : (
          <div className="h-36 flex items-center justify-center">
            <p className="text-muted-foreground">No activity data available</p>
          </div>
        )}
        
        <div className="mt-4 flex justify-end items-center gap-2">
          <div className="text-xs text-muted-foreground">Less</div>
          <div className="flex gap-1">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity, i) => (
              <div 
                key={i}
                className="h-2 w-3 rounded-sm"
                style={{ backgroundColor: `rgba(79, 70, 229, ${opacity})` }}
              />
            ))}
          </div>
          <div className="text-xs text-muted-foreground">More</div>
        </div>
      </CardContent>
    </Card>
  );
}
