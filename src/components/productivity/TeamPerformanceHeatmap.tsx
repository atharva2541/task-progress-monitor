
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { generateActivityHeatmapData } from '@/utils/productivity-utils';

export function TeamPerformanceHeatmap({ tasks, users, timeRange }) {
  const [heatmapData, setHeatmapData] = useState([]);
  
  useEffect(() => {
    const data = generateActivityHeatmapData(tasks, timeRange);
    setHeatmapData(data);
  }, [tasks, timeRange]);
  
  // Define weekdays and hours for the heatmap
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Get cell color based on activity level
  const getCellColor = (value) => {
    if (value === 0) return 'bg-gray-100';
    if (value < 3) return 'bg-purple-100';
    if (value < 6) return 'bg-purple-200';
    if (value < 10) return 'bg-purple-300';
    if (value < 15) return 'bg-purple-400';
    return 'bg-purple-500';
  };
  
  return (
    <div className="overflow-auto">
      <div className="min-w-[600px]">
        <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-1">
          <div className="h-6"></div> {/* Empty cell for spacing */}
          {weekdays.map(day => (
            <div key={day} className="h-6 flex items-center justify-center text-xs text-muted-foreground">
              {day}
            </div>
          ))}
          
          {hours.map(hour => (
            <React.Fragment key={hour}>
              <div className="h-6 text-xs text-right pr-2 text-muted-foreground flex items-center justify-end">
                {hour === 0 ? '12am' : hour === 12 ? '12pm' : hour > 12 ? `${hour-12}pm` : `${hour}am`}
              </div>
              {weekdays.map((_, dayIndex) => {
                const activityKey = `${dayIndex}-${hour}`;
                const activityValue = heatmapData[activityKey] || 0;
                return (
                  <div 
                    key={`${hour}-${dayIndex}`} 
                    className={`h-6 rounded ${getCellColor(activityValue)}`}
                    title={`${activityValue} task activities`}
                  ></div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex justify-end items-center gap-2 mt-4">
          <div className="text-xs text-muted-foreground">Activity level:</div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100"></div>
            <div className="w-3 h-3 bg-purple-100"></div>
            <div className="w-3 h-3 bg-purple-200"></div>
            <div className="w-3 h-3 bg-purple-300"></div>
            <div className="w-3 h-3 bg-purple-400"></div>
            <div className="w-3 h-3 bg-purple-500"></div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Low</span>
            <span className="mx-1">→</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
