import React from 'react';
import { GeminiInsights } from '@/lib/api';

interface InsightsPanelProps {
  insights: GeminiInsights;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  if (!insights) return null;
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md space-y-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Gemini AI Insights</h2>
      <div>
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Summary</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{insights.summary}</p>
      </div>
      <div>
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Mood Trend</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{insights.moodTrend}</p>
      </div>
      <div>
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Emotional Anchors</h3>
        <ul className="list-disc ml-6 text-gray-600 dark:text-gray-400 text-sm">
          {insights.emotionalAnchors.map((anchor, i) => (
            <li key={i}>{anchor}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Behavioral Patterns</h3>
        <ul className="list-disc ml-6 text-gray-600 dark:text-gray-400 text-sm">
          {insights.behavioralPatterns.map((pattern, i) => (
            <li key={i}>{pattern}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Advice</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{insights.advice}</p>
      </div>
      <div>
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Suggestions</h3>
        <ul className="list-disc ml-6 text-gray-600 dark:text-gray-400 text-sm">
          {insights.suggestions.map((suggestion, i) => (
            <li key={i}>{suggestion}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InsightsPanel;