import React from 'react';
import { MoodStat, GeminiInsightsWithDate } from '@/lib/api';

interface MoodTrendSummaryProps {
  stats: MoodStat[];
  insights: GeminiInsightsWithDate[];
}

function computeMoodTrend(stats: MoodStat[]): 'increasing' | 'decreasing' | 'stable' {
  if (stats.length < 2) return 'stable';
  const first = stats[0].averageMood;
  const last = stats[stats.length - 1].averageMood;
  if (last > first + 0.2) return 'increasing';
  if (last < first - 0.2) return 'decreasing';
  return 'stable';
}

function summarizeAnchors(insights: GeminiInsightsWithDate[]): string {
  const allAnchors = insights.flatMap(i => i.emotionalAnchors);
  if (!allAnchors.length) return '';
  const freq: Record<string, number> = {};
  allAnchors.forEach(a => { freq[a] = (freq[a] || 0) + 1; });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 2).map(([anchor]) => anchor);
  if (!top.length) return '';
  return `Recurring themes: ${top.join(', ')}.`;
}

const MoodTrendSummary: React.FC<MoodTrendSummaryProps> = ({ stats, insights }) => {
  const trend = computeMoodTrend(stats);
  const anchorSummary = summarizeAnchors(insights);
  let trendText = '';
  if (trend === 'increasing') trendText = 'your mood appears to be improving';
  else if (trend === 'decreasing') trendText = 'your mood appears to be declining';
  else trendText = 'your mood appears to be stable';

  return (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg text-blue-900 dark:text-blue-100">
      <b>This week, {trendText}.</b> {anchorSummary}
    </div>
  );
};

export default MoodTrendSummary;