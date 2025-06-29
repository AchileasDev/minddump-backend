import React from 'react';
import WordCloud from 'react-wordcloud';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import SkeletonLoader from './SkeletonLoader';

const fetchKeywords = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch('/api/users/keywords', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch keywords.');
  }
  return response.json();
};

const KeywordsCloud = () => {
  const { data: keywords, isLoading, isError, error } = useQuery({
    queryKey: ['keywords'],
    queryFn: fetchKeywords,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Recurring Themes</h2>
        <SkeletonLoader className="h-64 w-full" />
      </div>
    );
  }

  if (isError) {
    toast.error(`Could not load keywords: ${error.message}`);
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md h-full flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Error</h2>
        <p className="text-red-500 text-center">Could not load your keywords.</p>
      </div>
    );
  }
  
  if (!keywords || keywords.length === 0) {
     return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md h-full flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">No Themes Yet</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center">Your most used keywords will appear here.</p>
      </div>
    );
  }

  const options: any = {
    colors: ['#EC7CA5', '#d66f94', '#f09cb8', '#a35d76'],
    enableTooltip: true,
    deterministic: false,
    fontFamily: 'Inter, sans-serif',
    fontSizes: [18, 56] as [number, number],
    padding: 1,
    rotations: 3,
    rotationAngles: [0, 90],
    scale: 'sqrt',
    spiral: 'archimedean',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Recurring Themes</h2>
      <div style={{ height: 250, width: '100%' }}>
        <WordCloud words={keywords} options={options} />
      </div>
    </div>
  );
};

export default KeywordsCloud; 