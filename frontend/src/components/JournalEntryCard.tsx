import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { FiHeart, FiShare2, FiCopy, FiX } from 'react-icons/fi';
import { analyzeEntry } from '@/lib/analyzeEntry';
import { PremiumFeature } from './PremiumFeature';
import toast from 'react-hot-toast';

interface ReflectionQuestion {
  question: string;
  context?: string;
}

interface JournalEntryCardProps {
  id: string;
  content: string;
  createdAt: string;
  reflectionQuestions: ReflectionQuestion[];
  favoriteQuestions: string[];
  isTogglingFavorite: string | null;
  onToggleFavorite: (entryId: string, question: string) => void;
}

export default function JournalEntryCard({
  id,
  content,
  createdAt,
  reflectionQuestions,
  favoriteQuestions,
  isTogglingFavorite,
  onToggleFavorite,
}: JournalEntryCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [questions, setQuestions] = useState(reflectionQuestions);
  const [togglingQuestion, setTogglingQuestion] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Close share menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShare = async (type: 'clipboard' | 'twitter' | 'facebook') => {
    const excerpt = content.length > 200 ? content.substring(0, 200) + '...' : content;
    const shareText = `My journal entry from ${format(new Date(createdAt), 'MMMM d, yyyy')}:\n\n${excerpt}\n\nShared via MindDump`;

    switch (type) {
      case 'clipboard':
        try {
          await navigator.clipboard.writeText(shareText);
          toast.success('Copied to clipboard!');
        } catch (err) {
          toast.error('Failed to copy to clipboard');
        }
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`);
        break;
    }
    setShowShareMenu(false);
  };

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      const result = await analyzeEntry(content);
      const newQuestions = result.questions.map((q: string) => ({ question: q }));
      
      // Update UI immediately
      setQuestions(newQuestions);

      // Save to backend in the background
      try {
        const response = await fetch('/api/update-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            entryId: id,
            questions: newQuestions,
          }),
        });

        if (!response.ok) {
          console.error('Failed to save questions to backend:', await response.text());
        }
      } catch (error) {
        console.error('Error saving questions to backend:', error);
      }
    } catch (error) {
      console.error('Error analyzing entry:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleFavorite = async (question: string) => {
    if (togglingQuestion) return; // Prevent multiple simultaneous toggles

    try {
      setTogglingQuestion(question);
      const response = await fetch('/api/toggle-favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryId: id,
          question,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      // Toggle the question in the local state
      onToggleFavorite(id, question);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setTogglingQuestion(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md p-6 mb-4"
    >
      <div className="flex justify-between items-start mb-4">
        <time className="text-gray-500 text-sm">
          {format(new Date(createdAt), 'MMMM d, yyyy • h:mm a')}
        </time>
        <div className="relative" ref={shareMenuRef}>
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="p-2 text-gray-500 hover:text-[#EC7CA5] transition-colors rounded-full hover:bg-gray-100"
            aria-label="Share"
          >
            <FiShare2 className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10"
              >
                <button
                  onClick={() => handleShare('clipboard')}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FiCopy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Share on X
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Share on Facebook
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="prose max-w-none mb-6">
        <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
      </div>

      <PremiumFeature
        fallback={
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">Start your 14-day free trial to unlock AI insights</p>
            <button
              onClick={() => window.location.href = '/pricing'}
              className="px-4 py-2 bg-[#EC7CA5] text-white rounded-lg hover:bg-opacity-90 transition duration-300"
            >
              Start Free Trial
            </button>
          </div>
        }
      >
        {questions.length === 0 ? (
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze'
            )}
          </button>
        ) : (
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={index} className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleFavorite(q.question)}
                  disabled={togglingQuestion === q.question}
                  className={`mt-1 p-1 rounded-full transition-colors ${
                    favoriteQuestions.includes(q.question)
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-gray-400 hover:text-gray-500'
                  }`}
                >
                  <FiHeart className="w-5 h-5" />
                </button>
                <p className="text-gray-700">{q.question}</p>
              </div>
            ))}
          </div>
        )}
      </PremiumFeature>
    </motion.div>
  );
} 