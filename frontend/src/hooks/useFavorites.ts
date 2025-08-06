import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!user?.access_token) return;
    setLoading(true);
    setError(null);
    try {
      const favs = await api.getFavorites(user.access_token);
      setFavorites(favs);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch favorites');
      toast.error(e.message || 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  }, [user?.access_token]);

  useEffect(() => {
    if (user?.access_token) fetchFavorites();
  }, [user?.access_token, fetchFavorites]);

  const toggleFavorite = async (questionId: string) => {
    if (!user?.access_token) return;
    setLoading(true);
    try {
      if (favorites.includes(questionId)) {
        await api.removeFavorite(questionId, user.access_token);
        setFavorites(favorites.filter((id) => id !== questionId));
        toast.success('Removed from favorites');
      } else {
        await api.addFavorite(questionId, user.access_token);
        setFavorites([...favorites, questionId]);
        toast.success('Added to favorites');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to update favorite');
      toast.error(e.message || 'Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  return { favorites, toggleFavorite, loading, error };
};