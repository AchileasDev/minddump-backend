import React from 'react';
import WeeklyStatsChart from '@/components/WeeklyStatsChart';
import { useWeeklyStats } from '@/hooks/useWeeklyStats';
import { useRecentInsights } from '@/hooks/useRecentInsights';
import InsightsHistory from '@/components/InsightsHistory';
import MoodTrendSummary from '@/components/MoodTrendSummary';

const AnalyticsPage: React.FC = () => {
  const { stats, loading: statsLoading, error: statsError } = useWeeklyStats();
  const { insights, loading: insightsLoading, error: insightsError } = useRecentInsights();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      {(statsLoading || insightsLoading) && <div className="text-gray-500">Loading...</div>}
      {statsError && <div className="text-red-500">{statsError}</div>}
      {insightsError && <div className="text-red-500">{insightsError}</div>}
      <MoodTrendSummary stats={stats} insights={insights} />
      <div className="mb-8">
        <WeeklyStatsChart stats={stats} />
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent AI Insights</h2>
        <InsightsHistory insights={insights} />
      </div>
    </div>
  );
};

export default AnalyticsPage;