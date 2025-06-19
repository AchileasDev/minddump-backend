import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@supabase/ssr';
import { subDays, format, eachDayOfInterval } from 'date-fns';

interface WeeklyStats {
  totalEntries: number;
  emotions: {
    [key: string]: number;
  };
  trends: string[];
  dailyEmotions: {
    date: string;
    emotions: { [key: string]: number };
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create authenticated Supabase client
    // const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            // Use req.cookies if available, otherwise return undefined
            return (req.cookies && req.cookies[name]) || undefined;
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = subDays(endDate, 7);

    // Fetch entries from the last 7 days
    const { data: entries, error: entriesError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (entriesError) {
      throw entriesError;
    }

    // Analyze each entry using the analyze-entry endpoint
    const analysisPromises = entries.map(async (entry) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyze-entry`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ content: entry.content }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to analyze entry');
      }

      return response.json();
    });

    const analyses = await Promise.all(analysisPromises);

    // Aggregate results
    const stats: WeeklyStats = {
      totalEntries: entries.length,
      emotions: {},
      trends: [],
      dailyEmotions: [],
    };

    // Count emotions and identify trends
    const emotionCounts: { [key: string]: number } = {};
    const previousEmotions: { [key: string]: number } = {};
    const dailyEmotionMap: { [key: string]: { [key: string]: number } } = {};

    // Initialize daily emotion map with all days in the range
    eachDayOfInterval({ start: startDate, end: endDate }).forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      dailyEmotionMap[dateStr] = {};
    });

    analyses.forEach((analysis, index) => {
      const entryDate = format(new Date(entries[index].created_at), 'yyyy-MM-dd');
      const emotions = analysis.emotions || [];

      // Update daily emotions
      emotions.forEach((emotion: string) => {
        dailyEmotionMap[entryDate][emotion] = (dailyEmotionMap[entryDate][emotion] || 0) + 1;
      });

      // Update total emotions
      emotions.forEach((emotion: string) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });

      // Compare with previous entries to identify trends
      if (index > 0) {
        const prevEmotions = analyses[index - 1].emotions || [];
        prevEmotions.forEach((emotion: string) => {
          previousEmotions[emotion] = (previousEmotions[emotion] || 0) + 1;
        });
      }
    });

    // Calculate most frequent emotions
    stats.emotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .reduce((acc, [emotion, count]) => {
        acc[emotion] = count;
        return acc;
      }, {} as { [key: string]: number });

    // Identify trends
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      const prevCount = previousEmotions[emotion] || 0;
      if (count > prevCount) {
        stats.trends.push(`More ${emotion}`);
      } else if (count < prevCount) {
        stats.trends.push(`Less ${emotion}`);
      }
    });

    // Convert daily emotion map to array format
    stats.dailyEmotions = Object.entries(dailyEmotionMap).map(([date, emotions]) => ({
      date,
      emotions,
    }));

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 