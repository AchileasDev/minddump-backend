import React from 'react';
import FavoriteButton from './FavoriteButton';

interface FavoritesListProps {
  questionIds: string[];
}

// Mock question data (replace with real data integration as needed)
const mockQuestions: Record<string, string> = {
  'q1': 'What are you grateful for today?',
  'q2': 'What challenged you this week?',
  'q3': 'Describe a recent moment of joy.',
  'q4': 'What is one thing you want to improve?',
  'q5': 'How did you take care of yourself?',
};

const FavoritesList: React.FC<FavoritesListProps> = ({ questionIds }) => {
  if (!questionIds.length) {
    return <div className="text-gray-500">No favorite questions yet.</div>;
  }
  return (
    <ul className="space-y-4">
      {questionIds.map((id) => (
        <li key={id} className="flex items-center space-x-3">
          <span className="flex-1 text-gray-800">{mockQuestions[id] || id}</span>
          <FavoriteButton questionId={id} />
        </li>
      ))}
    </ul>
  );
};

export default FavoritesList;