import { supabase } from '../utils/supabaseClient';

export interface GeminiInsightsWithDate {
  date: string;
  summary: string;
  moodTrend: string;
  emotionalAnchors: string[];
  behavioralPatterns: string[];
  advice: string;
  suggestions: string[];
}

export async function getRecentInsights(userId: string): Promise<GeminiInsightsWithDate[]> {
  const { data, error } = await supabase
    .from('insights')
    .select('date, summary, moodTrend, emotionalAnchors, behavioralPatterns, advice, suggestions')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(5);
  if (error) throw new Error(error.message);
  return data || [];
}