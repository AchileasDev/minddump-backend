import React, { useState } from 'react';
import { ReflectionQuestion } from '@/lib/api';
import FavoriteButton from './FavoriteButton';

interface ReflectionQuestionCardProps {
  question: ReflectionQuestion;
  onAnswerSubmit: (questionId: string, answer: string) => void;
  isFavorite: boolean;
}

const ReflectionQuestionCard: React.FC<ReflectionQuestionCardProps> = ({ question, onAnswerSubmit, isFavorite }) => {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setSubmitting(true);
    await onAnswerSubmit(question.id, answer);
    setAnswer('');
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center mb-2">
        <div className="font-semibold text-gray-800 dark:text-white flex-1">{question.text}</div>
        <FavoriteButton questionId={question.id} />
      </div>
      <div className="flex items-center space-x-2">
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#EC7CA5]"
          placeholder="Your answer..."
          disabled={submitting}
          rows={2}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#EC7CA5] text-white rounded hover:bg-[#d66f94] disabled:opacity-50"
          disabled={submitting || !answer.trim()}
        >
          {submitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default ReflectionQuestionCard;