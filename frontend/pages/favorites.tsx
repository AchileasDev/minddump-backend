import React from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import FavoritesList from '@/components/FavoritesList';

const FavoritesPage: React.FC = () => {
  const { favorites, loading, error } = useFavorites();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Your Favorite Reflection Questions</h1>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <FavoritesList questionIds={favorites} />
    </div>
  );
};

export default FavoritesPage; 