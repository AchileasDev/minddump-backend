import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { MoodStat } from '@/lib/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WeeklyStatsChartProps {
  stats: MoodStat[];
}

const WeeklyStatsChart: React.FC<WeeklyStatsChartProps> = ({ stats }) => {
  if (!stats || stats.length === 0) {
    return <div className="text-gray-500">No mood data for the past week.</div>;
  }

  const chartData = {
    labels: stats.map((s) => s.date),
    datasets: [
      {
        label: 'Average Mood',
        data: stats.map((s) => s.averageMood),
        fill: false,
        borderColor: '#EC7CA5',
        backgroundColor: '#EC7CA5',
        tension: 0.3,
        pointBackgroundColor: '#EC7CA5',
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Weekly Mood Trend',
      },
    },
    scales: {
      y: {
        min: 1,
        max: 5,
        title: {
          display: true,
          text: 'Mood (1-5)',
        },
        ticks: { color: '#9CA3AF' },
        grid: { color: '#F3E8EE' },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
        ticks: { color: '#9CA3AF' },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default WeeklyStatsChart;