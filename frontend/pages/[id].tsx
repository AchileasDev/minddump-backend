import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiHeart } from 'react-icons/fi';

// This would come from an API in a real application
const MOCK_ENTRIES = [
  {
    id: '1',
    date: '2023-09-15',
    title: 'Feeling overwhelmed',
    content: `Too many deadlines this week. Feeling stressed but trying to stay positive.

I need to figure out a better way to manage my time. Maybe I should try that Pomodoro technique everyone talks about? I also think I need to be more assertive about saying no to additional tasks when I'm already at capacity.

Tomorrow I'll try to wake up earlier and tackle the most important task first.`,
    mood: 'anxious',
    sentiment: 'negative',
    insight: 'Consider breaking down large tasks into smaller, manageable steps to reduce feeling overwhelmed.'
  },
  {
    id: '2',
    date: '2023-09-13',
    title: 'Great day!',
    content: `Had a productive meeting and then went for a long walk in the park. Feeling refreshed.

The meeting with the design team went really well. They loved my ideas, and we're moving forward with the project.

After work, I went for a 45-minute walk at the nearby park. The weather was perfect, and I could feel my stress melting away with each step.`,
    mood: 'happy',
    sentiment: 'positive',
    insight: 'Nature walks appear to have a positive impact on your mood and productivity.'
  },
  {
    id: '3',
    date: '2023-09-10',
    title: 'Mixed feelings today',
    content: `Started the day feeling down but had a good conversation with a friend that lifted my spirits.

Woke up feeling quite low for no particular reason. Just one of those days, I guess. Work was somewhat monotonous.

Alex called in the evening, and we had a long chat about life, future plans, and some funny memories. It's amazing how a good conversation can change your entire outlook.`,
    mood: 'mixed',
    sentiment: 'neutral',
    insight: 'Social connections seem to play an important role in improving your mood when feeling low.'
  }
];

const EntryPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [entry, setEntry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    // Only fetch when ID is available
    if (id) {
      // In a real app, this would be an API call
      const foundEntry = MOCK_ENTRIES.find(e => e.id === id);
      if (foundEntry) {
        setEntry(foundEntry);
      } else {
        // Entry not found
        router.push('/dashboard');
      }
      setIsLoading(false);
    }
  }, [id, router]);

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'anxious': return '😰';
      case 'mixed': return '😐';
      default: return '🤔';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        <title>{entry.title} | MindDump</title>
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
                <h2 className="text-2xl font-semibold">{entry.title}</h2>
                <p className="text-gray-500 mt-1">
                  {new Date(entry.date).toLocaleDateString('en-US', {
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
                  {entry.sentiment}
                </span>
              </div>
            </div>

            <div className="prose max-w-none">
              {entry.content.split('\n\n').map((paragraph: string, idx: number) => (
                <p key={idx} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="bg-secondary p-6 rounded-2xl shadow-sm mb-8">
            <h3 className="text-xl font-semibold mb-3">AI Insight</h3>
            <p className="italic">"{entry.insight}"</p>
          </div>

          <div className="flex justify-between">
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