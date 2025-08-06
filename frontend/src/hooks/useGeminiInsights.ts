import { useState } from 'react';
import { api, GeminiInsights } from '@/lib/api';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useGeminiInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<GeminiInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!user?.access_token) throw new Error('Not authenticated');
      const result = await api.getGeminiInsights(text, user.access_token);
      setInsights(result);
    } catch (e: any) {
      setError(e.message || 'Failed to analyze entry');
      toast.error(e.message || 'Failed to analyze entry');
    } finally {
      setLoading(false);
    }
  };

  return { insights, loading, error, analyze };
};