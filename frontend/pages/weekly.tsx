import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';

interface WeeklyStats {
  totalEntries: number;
  emotions: {
    [key: string]: number;
  };
  trends: string[];
  dailyEmotions?: {
    date: string;
    emotions: { [key: string]: number };
  }[];
}

const getMoodEmoji = (mood: string) => {
  const emojiMap: { [key: string]: string } = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    anxious: '😰',
    excited: '🤩',
    calm: '😌',
    grateful: '🙏',
    tired: '😴',
    confused: '😕',
    hopeful: '✨',
  };
  return emojiMap[mood.toLowerCase()] || '😐';
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function WeeklySummaryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [weeklyData, setWeeklyData] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchWeeklyStats = async () => {
      try {
        const response = await api.getWeeklyStatsData();
        
        if (response.success && response.data) {
          setWeeklyData(response.data as WeeklyStats);
        } else {
          throw new Error(response.message || 'Failed to fetch weekly stats');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weekly stats';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchWeeklyStats();
    }
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EC7CA5]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F8E4EC] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!weeklyData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F8E4EC] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">No Data Available</h2>
            <p className="text-gray-600">Start journaling to see your weekly insights!</p>
          </div>
        </div>
      </div>
    );
  }

  // Get top emotions
  const topEmotions = Object.entries(weeklyData.emotions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([emotion]) => emotion);

  // Get dominant mood (most frequent emotion)
  const dominantMood = topEmotions[0] || 'neutral';
  const dominantMoodCount = weeklyData.emotions[dominantMood] || 0;
  const totalEmotions = Object.values(weeklyData.emotions).reduce((a, b) => a + b, 0);
  const dominantMoodPercentage = Math.round((dominantMoodCount / totalEmotions) * 100);

  // Prepare data for charts
  const emotionData = Object.entries(weeklyData.emotions)
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: Math.round((count / totalEmotions) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <>
      <Head>
        <title>Weekly Summary | MindDump</title>
        <meta name="description" content="Your weekly journaling insights" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-white to-[#F8E4EC] px-4">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mr-4 p-2 text-gray-600 hover:text-[#EC7CA5] transition-colors"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-[#EC7CA5]">Weekly Summary</h1>
              </div>
            </div>
          </div>
        </nav>

        <motion.div
          className="max-w-4xl mx-auto p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="bg-white p-8 rounded-2xl shadow-sm mb-8"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-semibold mb-6">Your Week in Review</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                className="bg-gray-50 p-4 rounded-xl"
                variants={itemVariants}
              >
                <h3 className="font-medium text-gray-700 mb-2">Journal Entries</h3>
                <p className="text-3xl font-bold text-[#EC7CA5]">{weeklyData.totalEntries}</p>
              </motion.div>

              <motion.div
                className="bg-gray-50 p-4 rounded-xl"
                variants={itemVariants}
              >
                <h3 className="font-medium text-gray-700 mb-2">Dominant Mood</h3>
                <div className="flex items-center">
                  <span className="text-3xl mr-2">{getMoodEmoji(dominantMood)}</span>
                  <div>
                    <p className="text-lg font-semibold capitalize">{dominantMood}</p>
                    <p className="text-sm text-gray-500">{dominantMoodPercentage}% of entries</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-gray-50 p-4 rounded-xl"
                variants={itemVariants}
              >
                <h3 className="font-medium text-gray-700 mb-2">Top Emotions</h3>
                <div className="space-y-1">
                  {topEmotions.slice(0, 3).map((emotion) => (
                    <div key={emotion} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{emotion}</span>
                      <span className="text-sm font-medium">
                        {Math.round((weeklyData.emotions[emotion] / totalEmotions) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Emotion Distribution Chart */}
            <motion.div
              className="mb-8"
              variants={itemVariants}
            >
              <h3 className="text-lg font-semibold mb-4">Emotion Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emotionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="emotion" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#EC7CA5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Weekly Trends */}
            {weeklyData.trends && weeklyData.trends.length > 0 && (
              <motion.div
                className="bg-gray-50 p-6 rounded-xl"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold mb-4">Weekly Trends</h3>
                <ul className="space-y-2">
                  {weeklyData.trends.map((trend, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-[#EC7CA5] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{trend}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </>
  );
} 