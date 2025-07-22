import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/hooks/useAuth';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import JournalEntryCard from '@/components/JournalEntryCard';
import { FiArrowLeft, FiSearch, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { subMonths, startOfDay, endOfDay } from 'date-fns';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import toast from 'react-hot-toast';

interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
  reflection_questions: Array<{
    question: string;
    context?: string;
  }>;
  favorite_questions: string[];
  is_favorite: boolean;
  analysis?: {
    sentiment: string;
    emotions: string[];
    summary: string;
  };
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const History: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<{ start: Date; end: Date } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPremium] = useState(true); // TODO: Replace with actual premium check
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();
  const { 
    entries, 
    isLoading, 
    error, 
    toggleFavorite, 
    deleteEntry 
  } = useJournalEntries({
    page,
    pageSize: 10,
    searchQuery,
    dateFilter: dateFilter || undefined,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleDateFilterChange = (range: 'week' | 'month' | 'all') => {
    const now = new Date();
    switch (range) {
      case 'week':
        setDateFilter({
          start: startOfDay(subMonths(now, 1)),
          end: endOfDay(now),
        });
        break;
      case 'month':
        setDateFilter({
          start: startOfDay(subMonths(now, 3)),
          end: endOfDay(now),
        });
        break;
      case 'all':
        setDateFilter(null);
        break;
    }
    setShowDatePicker(false);
  };

  const handleToggleFavorite = async (entryId: string, question: string) => {
    try {
      toggleFavorite({ entryId, question });
      
      // Fire GA4 event for add_to_favorites
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'add_to_favorites', {
          entry_id: entryId,
          question,
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const handleShare = async (entry: JournalEntry) => {
    try {
      await navigator.share({
        title: 'My Journal Entry',
        text: entry.content,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopy = async (entry: JournalEntry) => {
    try {
      await navigator.clipboard.writeText(entry.content);
      toast.success('Copied to clipboard!');
    } catch (error) {
      console.error('Error copying:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      deleteEntry(entryId);
      toast.success('Entry deleted successfully');
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const handleAnalyze = async (entry: JournalEntry) => {
    if (!isPremium) {
      return;
    }

    try {
      setIsAnalyzing(true);
      
      // Fire GA4 event for generate_insight
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'generate_insight', {
          entry_id: entry.id,
        });
      }
      
      const response = await api.analyzeDump(entry.content);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to analyze entry');
      }

      toast.success('Analysis completed!');
    } catch (error) {
      console.error('Error analyzing entry:', error);
      toast.error('Failed to analyze entry');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const buttonLabel: string = (Boolean(searchQuery) || Boolean(dateFilter)) ? 'Clear Filters' : 'Write Your First Entry';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Journal History | MindDump</title>
        <meta name="description" content="View and manage your journal entries" />
      </Head>
      
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Journal History</h1>
              </div>
              
              <button
                onClick={() => router.push('/dashboard/new-entry')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                {buttonLabel}
              </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search your entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FiCalendar className="w-5 h-5" />
                    <span>Filter by Date</span>
                  </button>
                  
                  {showDatePicker && (
                    <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
                      <div className="space-y-2">
                        <button
                          onClick={() => handleDateFilterChange('week')}
                          className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                        >
                          Last Week
                        </button>
                        <button
                          onClick={() => handleDateFilterChange('month')}
                          className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                        >
                          Last Month
                        </button>
                        <button
                          onClick={() => handleDateFilterChange('all')}
                          className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                        >
                          All Time
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Entries */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            ) : entries && entries.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No entries found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || dateFilter 
                    ? 'Try adjusting your search or date filter'
                    : 'Start your journaling journey by creating your first entry'
                  }
                </p>
                <button
                  onClick={() => router.push('/dashboard/new-entry')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Create New Entry
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {(entries ?? []).map((entry: any) => (
                  <JournalEntryCard
                    key={entry.id}
                    id={entry.id}
                    content={entry.content}
                    createdAt={new Date(entry.created_at)}
                    reflectionQuestions={entry.reflection_questions || []}
                    favoriteQuestions={entry.favorite_questions || []}
                    isFavorite={entry.is_favorite}
                    onToggleFavorite={handleToggleFavorite}
                    onShare={() => handleShare(entry)}
                    onCopy={() => handleCopy(entry)}
                    onDelete={() => handleDelete(entry.id)}
                    onAnalyze={() => handleAnalyze(entry)}
                    isAnalyzing={isAnalyzing}
                    isPremium={isPremium}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {(entries ?? []).length > 0 && (
              <div className="flex items-center justify-center mt-8 space-x-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                
                <span className="px-4 py-2 text-gray-600">Page {page}</span>
                
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={(entries ?? []).length < 10}
                  className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default History; 