import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface FavoriteQuestion {
  id: string;
  question: string;
  entryId: string;
  entryContent: string;
  createdAt: string;
}

export default function FavoritesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      // Since we don't have a specific favorites endpoint, we'll get all entries
      // and filter for those with favorite questions
      const response = await api.getDumps();
      
      if (response.success && response.data) {
        const allEntries = response.data as any[];
        const favoriteQuestions: FavoriteQuestion[] = [];
        
        allEntries.forEach(entry => {
          if (entry.favorite_questions && entry.favorite_questions.length > 0) {
            entry.favorite_questions.forEach((question: string) => {
              favoriteQuestions.push({
                id: `${entry.id}-${question}`,
                question,
                entryId: entry.id,
                entryContent: entry.content,
                createdAt: entry.created_at,
              });
            });
          }
        });
        
        setFavorites(favoriteQuestions);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Favorites</h1>
            <p className="text-gray-600 mb-6">
              Your saved reflection questions and insights
            </p>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⭐</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No favorites yet</h3>
                <p className="text-gray-500 mb-6">
                  Start journaling to discover reflection questions you'll love
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Start Journaling
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                    <p className="text-gray-800 font-medium">{favorite.question}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">
                        From: {favorite.entryContent.substring(0, 50)}...
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(favorite.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={() => router.push(`/${favorite.entryId}`)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View Entry →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 