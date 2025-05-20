
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeRangeSelector } from './TimeRangeSelector';
import { TeamProductivityTable } from './TeamProductivityTable';
import { TeamComparisonChart } from './TeamComparisonChart';
import { TeamPerformanceHeatmap } from './TeamPerformanceHeatmap';
import { generateTeamComparisonData } from '@/utils/productivity-utils';

export function TeamComparisonView({ tasks, users }) {
  const [timeRange, setTimeRange] = useState('3months');
  const [comparisonMetric, setComparisonMetric] = useState('completionRate');
  const teamData = generateTeamComparisonData(tasks, users, timeRange);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Team Comparison</h2>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamProductivityTable teamData={teamData} />
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamComparisonChart teamData={teamData} metric={comparisonMetric} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Activity Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamPerformanceHeatmap tasks={tasks} timeRange={timeRange} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
