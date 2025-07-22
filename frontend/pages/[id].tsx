import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiHeart } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface JournalEntry {
  id: string;
  content: string;
  mood?: string;
  tags?: string[];
  reflection_questions?: Array<{
    question: string;
    context: string;
  }>;
  favorite_questions?: string[];
  emotions?: string[];
  sentiment?: string;
  sentiment_score?: number;
  insight?: string;
  created_at: string;
  updated_at: string;
}

const EntryPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // Only fetch when ID is available and user is authenticated
    if (id && user) {
      fetchEntry();
    }
  }, [id, user, loading, router]);

  const fetchEntry = async () => {
    if (!id || typeof id !== 'string') return;
    
    try {
      const response = await api.getDump(id);
      
      if (response.success && response.data) {
        setEntry(response.data as JournalEntry);
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

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'anxious': return '😰';
      case 'mixed': return '😐';
      case 'sad': return '😢';
      case 'excited': return '🤩';
      case 'calm': return '😌';
      default: return '🤔';
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || (!user && typeof window !== 'undefined')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-secondary">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-secondary">
        <div className="text-primary text-xl">Loading your mind dump...</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-secondary">
        <div className="text-red-500 text-xl">Entry not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-secondary">
      <Head>
        <title>Journal Entry | MindDump</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <header className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center">
            <h1 className="text-3xl font-bold text-primary">MindDump</h1>
          </Link>
          
          <nav className="flex items-center">
            <Link href="/dashboard" className="mr-6 text-gray-600 hover:text-primary">
              Dashboard
            </Link>
            <Link href="/favorites" className="mr-6 text-gray-600 hover:text-primary flex items-center">
              <FiHeart className="w-5 h-5 mr-1" />
              Favorites
            </Link>
            <Link href="/dashboard/settings" className="mr-6 text-gray-600 hover:text-primary">
              Settings
            </Link>
          </nav>
        </header>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-sm mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Journal Entry</h2>
                <p className="text-gray-500 mt-1">
                  {new Date(entry.created_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center">
                <div className="text-3xl mr-3">{getMoodEmoji(entry.mood)}</div>
                <span className={`text-sm px-3 py-1 rounded-full ${getSentimentColor(entry.sentiment)}`}>
                  {entry.sentiment || 'neutral'}
                </span>
              </div>
            </div>

            <div className="prose max-w-none">
              {entry.content.split('\n\n').map((paragraph: string, idx: number) => (
                <p key={idx} className="mb-4">{paragraph}</p>
              ))}
            </div>

            {entry.tags && entry.tags.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {entry.insight && (
            <div className="bg-secondary p-6 rounded-2xl shadow-sm mb-8">
              <h3 className="text-xl font-semibold mb-3">AI Insight</h3>
              <p className="italic">"{entry.insight}"</p>
            </div>
          )}

          {entry.reflection_questions && entry.reflection_questions.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
              <h3 className="text-xl font-semibold mb-4">Reflection Questions</h3>
              <div className="space-y-4">
                {entry.reflection_questions.map((question, idx) => (
                  <div key={idx} className="border-l-4 border-indigo-500 pl-4">
                    <p className="font-medium text-gray-800">{question.question}</p>
                    {question.context && (
                      <p className="text-sm text-gray-600 mt-1">{question.context}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <Link
              href="/dashboard"
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
            >
              ← Back to all entries
            </Link>
            <Link
              href={`/dashboard/entry/edit/${entry.id}`}
              className="px-5 py-2 border border-primary text-primary rounded-xl hover:bg-primary hover:text-white"
            >
              Edit entry
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryPage; 