import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { JournalEntryCard } from '../components/JournalEntryCard';
import { FiArrowLeft, FiSearch, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { format, subMonths, startOfDay, endOfDay } from 'date-fns';

export default function History() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<{ start: Date; end: Date } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { entries, isLoading, error, toggleFavorite, isTogglingFavorite } = useJournalEntries({
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

  const handleToggleFavorite = (entryId: string, question: string) => {
    toggleFavorite({ entryId, question });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EC7CA5]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Journal History | MindDump</title>
        <meta name="description" content="View your journal history" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-white to-[#F8E4EC]">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mr-4 p-2 text-gray-600 hover:text-[#EC7CA5] transition-colors"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-[#EC7CA5]">Journal History</h1>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Search and Filter Controls */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search entries..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#EC7CA5] focus:border-transparent"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#EC7CA5] focus:border-transparent"
                >
                  <FiCalendar className="mr-2 h-5 w-5 text-gray-400" />
                  {dateFilter ? 'Filtered' : 'Filter by date'}
                </button>
                {showDatePicker && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handleDateFilterChange('week')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Last week
                      </button>
                      <button
                        onClick={() => handleDateFilterChange('month')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Last month
                      </button>
                      <button
                        onClick={() => handleDateFilterChange('all')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        All time
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {dateFilter && (
              <div className="text-sm text-gray-500">
                Showing entries from {format(dateFilter.start, 'MMM d, yyyy')} to{' '}
                {format(dateFilter.end, 'MMM d, yyyy')}
              </div>
            )}
          </div>

          {error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : entries?.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No entries found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || dateFilter
                    ? 'Try adjusting your search or filters'
                    : 'Start your journaling journey by writing your first entry.'}
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#EC7CA5] hover:bg-[#EC7CA5]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EC7CA5]"
                >
                  {searchQuery || dateFilter ? 'Clear Filters' : 'Write Your First Entry'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {entries?.map((entry) => (
                  <JournalEntryCard
                    key={entry.id}
                    id={entry.id}
                    content={entry.content}
                    reflectionQuestions={entry.reflection_questions}
                    favoriteQuestions={entry.favorite_questions}
                    createdAt={entry.created_at}
                    onToggleFavorite={handleToggleFavorite}
                    isTogglingFavorite={isTogglingFavorite}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="mt-8 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {page}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!entries || entries.length < 10}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
} 