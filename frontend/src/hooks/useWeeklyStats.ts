import { useState, useEffect, useCallback } from 'react';
import { api, MoodStat } from '@/lib/api';
import { useAuth } from './useAuth';

export const useWeeklyStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<MoodStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user?.access_token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getWeeklyMoodStats(user.access_token);
      setStats(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch weekly stats');
    } finally {
      setLoading(false);
    }
  }, [user?.access_token]);

  useEffect(() => {
    if (user?.access_token) fetchStats();
  }, [user?.access_token, fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
};