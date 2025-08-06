import React, { useState } from 'react';
import { GeminiInsightsWithDate } from '@/lib/api';

interface InsightsHistoryProps {
  insights: GeminiInsightsWithDate[];
}

const InsightsHistory: React.FC<InsightsHistoryProps> = ({ insights }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!insights.length) {
    return <div className="text-gray-500">No recent insights available.</div>;
  }

  return (
    <div className="space-y-4">
      {insights.map((insight, idx) => (
        <div key={idx} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpenIndex(openIndex === idx ? null : idx)}>
            <div>
              <div className="text-xs text-gray-400">{new Date(insight.date).toLocaleDateString()}</div>
              <div className="font-semibold text-gray-800 dark:text-white">{insight.summary}</div>
            </div>
            <button className="text-xs text-blue-500">{openIndex === idx ? 'Hide' : 'Details'}</button>
          </div>
          {openIndex === idx && (
            <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <div><b>Mood Trend:</b> {insight.moodTrend}</div>
              <div><b>Emotional Anchors:</b> <ul className="list-disc ml-6">{insight.emotionalAnchors.map((a, i) => <li key={i}>{a}</li>)}</ul></div>
              <div><b>Behavioral Patterns:</b> <ul className="list-disc ml-6">{insight.behavioralPatterns.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
              <div><b>Advice:</b> {insight.advice}</div>
              <div><b>Suggestions:</b> <ul className="list-disc ml-6">{insight.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InsightsHistory;