import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/hooks/useAuth';
import { useJournalEntries } from '../../src/hooks/useJournalEntries';
import Header from '../../src/components/Header';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function NewEntryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState('');
  const { createEntry, isCreating } = useJournalEntries();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      createEntry({ content: content.trim() }, {
        onSuccess: (newEntry: any) => {
          // Fire GA4 event for create_dump
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'create_dump', {
              entry_id: newEntry.id,
              content_length: content.length,
            });
          }

          toast.success('Entry created successfully!');
          router.push(`/${newEntry.id}`);
        },
        onError: (error) => {
          console.error('Error creating entry:', error);
          toast.error('Failed to create entry. Please try again.');
        }
      });
    } catch (error) {
      console.error('Error creating entry:', error);
      toast.error('Failed to create entry. Please try again.');
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
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Create New Entry</h1>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's on your mind today?
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Write your thoughts, feelings, or anything you'd like to reflect on..."
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  {content.length} characters
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row justify-end gap-4 md:space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !content.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 