import React from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface FavoriteButtonProps {
  questionId: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ questionId }) => {
  const { favorites, toggleFavorite, loading } = useFavorites();
  const isFavorite = favorites.includes(questionId);

  return (
    <button
      onClick={() => toggleFavorite(questionId)}
      disabled={loading}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      className="focus:outline-none"
    >
      {isFavorite ? (
        <FaHeart className="text-[#EC7CA5] w-5 h-5" />
      ) : (
        <FaRegHeart className="text-gray-400 w-5 h-5" />
      )}
    </button>
  );
};

export default FavoriteButton;