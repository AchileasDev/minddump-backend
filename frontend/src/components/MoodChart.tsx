import React from 'react';
import { Line } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import SkeletonLoader from './SkeletonLoader';
import { useAuth } from '@/hooks/useAuth';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const fetchMoodHistory = async (accessToken: string) => {
  const response = await fetch('/api/users/mood-history', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch mood history.');
  }
  return response.json();
};

const MoodChart = () => {
  const { user } = useAuth();
  const accessToken = user?.access_token;

  const { data: moodHistory, isLoading, isError, error } = useQuery({
    queryKey: ['moodHistory', accessToken],
    queryFn: () => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchMoodHistory(accessToken);
    },
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md h-full">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Mood History</h2>
        <SkeletonLoader className="h-64 w-full" />
      </div>
    );
  }

  if (isError) {
    toast.error(`Could not load mood chart: ${error.message}`);
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md h-full flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Error</h2>
        <p className="text-red-500 text-center">Could not load mood history.</p>
      </div>
    );
  }
  
  if (!moodHistory || moodHistory.length < 2) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md h-full flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Not Enough Data</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center">Your mood chart will appear here after a few entries.</p>
      </div>
    );
  }

  const chartData = {
    labels: moodHistory.map((entry: any) => new Date(entry.created_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Sentiment Score',
        data: moodHistory.map((entry: any) => entry.sentiment_score),
        fill: true,
        backgroundColor: 'rgba(236, 124, 165, 0.2)',
        borderColor: '#EC7CA5',
        tension: 0.4,
        pointBackgroundColor: '#EC7CA5',
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        min: -1,
        max: 1,
        ticks: { color: '#9CA3AF' },
        grid: { color: '#374151' }
      },
      x: {
        ticks: { color: '#9CA3AF' },
        grid: { display: false }
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Mood History (Last 30 Days)</h2>
      <div className="h-64 relative">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default MoodChart; 