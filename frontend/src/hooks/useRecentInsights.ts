import { useState, useEffect, useCallback } from 'react';
import { api, GeminiInsightsWithDate } from '@/lib/api';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useRecentInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<GeminiInsightsWithDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!user?.access_token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRecentInsights(user.access_token);
      setInsights(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch insights');
      toast.error(e.message || 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  }, [user?.access_token]);

  useEffect(() => {
    if (user?.access_token) fetchInsights();
  }, [user?.access_token, fetchInsights]);

  return { insights, loading, error, refresh: fetchInsights };
};