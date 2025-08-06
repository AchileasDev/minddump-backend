import React from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import SkeletonLoader from './SkeletonLoader';
import { useAuth } from '@/hooks/useAuth';

// This function will be called by react-query to fetch the data
const fetchInsights = async (accessToken: string, userId: string) => {
  // First, fetch entries to pass to the insights endpoint
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { supabase } = await import('@/lib/supabase');
  const { data: entries, error: entriesError } = await supabase
    .from('journal_entries')
    .select('content,created_at')
    .eq('user_id', userId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(30);

  if (entriesError) throw entriesError;
  if (!entries || entries.length === 0) return null; // Return null if no entries to analyze

  // Now, call our backend API
  const response = await fetch('/api/ai/insights', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ entries }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch insights.');
  }
  
  return response.json();
};

const InsightsCard = () => {
  const { user } = useAuth();
  const accessToken = user?.access_token;
  const userId = user?.id;

  const { data: insights, isLoading, isError, error } = useQuery({
    queryKey: ['insights', userId],
    queryFn: () => {
      if (!accessToken || !userId) throw new Error('Not authenticated');
      return fetchInsights(accessToken, userId);
    },
    enabled: !!accessToken && !!userId,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1, // Retry once on failure
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md h-full">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Your AI Insights</h2>
        <div className="space-y-4">
          <SkeletonLoader className="h-4 w-3/4" />
          <SkeletonLoader className="h-4 w-1/2" />
          <SkeletonLoader className="h-10 w-full" />
          <SkeletonLoader className="h-4 w-1/3" />
          <SkeletonLoader className="h-8 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    toast.error(`Could not load insights: ${error.message}`);
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md h-full flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Error</h2>
        <p className="text-red-500 text-center">Could not load your AI insights. Please try again later.</p>
      </div>
    );
  }
  
  if (!insights) {
     return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md h-full flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Not Enough Data</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center">Write a few journal entries to unlock your first AI insights.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Your AI Insights</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Summary</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{insights.summary}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Suggestion</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{insights.insightful_advice}</p>
        </div>
      </div>
    </div>
  );
};

export default InsightsCard; 