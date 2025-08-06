import React from 'react';
import { useReflections } from '@/hooks/useReflections';
import ReflectionQuestionCard from '@/components/ReflectionQuestionCard';
import ReflectionAnswerList from '@/components/ReflectionAnswerList';
import { useFavorites } from '@/hooks/useFavorites';

const ReflectionsPage: React.FC = () => {
  const { questions, answers, loading, error, answerQuestion } = useReflections();
  const { favorites } = useFavorites();

  // Helper to map questionId to question text
  const getQuestionText = (questionId: string) => {
    const q = questions.find(q => q.id === questionId);
    return q ? q.text : questionId;
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Reflection Questions</h1>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="space-y-4 mb-10">
        {questions.map((q) => (
          <ReflectionQuestionCard
            key={q.id}
            question={q}
            onAnswerSubmit={answerQuestion}
            isFavorite={favorites.includes(q.id)}
          />
        ))}
      </div>
      <h2 className="text-xl font-semibold mb-4">Your Answers</h2>
      <ReflectionAnswerList answers={answers} getQuestionText={getQuestionText} />
    </div>
  );
};

export default ReflectionsPage;