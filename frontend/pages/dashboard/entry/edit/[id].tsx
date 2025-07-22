import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface JournalEntry {
  id: string;
  content: string;
  mood?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export default function EditEntryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState('');
  const { updateEntry, isUpdating } = useJournalEntries();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && id) {
      fetchEntry();
    }
  }, [user, id]);

  const fetchEntry = async () => {
    if (!id || typeof id !== 'string') return;
    
    try {
      const response = await api.getDump(id);
      
      if (response.success && response.data) {
        const entryData = response.data as JournalEntry;
        setContent(entryData.content || '');
      } else {
        toast.error('Entry not found');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
      toast.error('Failed to load entry');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim() || !id || typeof id !== 'string') return;

    try {
      updateEntry({ id, data: { content: content.trim() } }, {
        onSuccess: () => {
          toast.success('Entry updated successfully!');
          router.push(`/${id}`);
        },
        onError: (error: Error) => {
          console.error('Error saving entry:', error);
          toast.error('Failed to save entry');
        }
      });
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Edit Entry</h1>
              <button
                onClick={() => router.push(`/${id}`)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your thoughts
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Write your thoughts here..."
              />
            </div>
            
            <div className="flex flex-col md:flex-row justify-end gap-4 md:space-x-4">
              <button
                onClick={() => router.push(`/${id}`)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating || !content.trim()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 