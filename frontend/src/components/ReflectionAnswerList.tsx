import React from 'react';
import { ReflectionAnswer } from '@/lib/api';

interface ReflectionAnswerListProps {
  answers: ReflectionAnswer[];
  getQuestionText: (questionId: string) => string;
}

const ReflectionAnswerList: React.FC<ReflectionAnswerListProps> = ({ answers, getQuestionText }) => {
  if (!answers.length) {
    return <div className="text-gray-500">No answers yet.</div>;
  }
  return (
    <ul className="space-y-4">
      {answers.map((a, i) => (
        <li key={i} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg shadow">
          <div className="font-semibold text-gray-800 dark:text-white mb-1">{getQuestionText(a.questionId)}</div>
          <div className="text-gray-700 dark:text-gray-200">{a.answer}</div>
          <div className="text-xs text-gray-400 mt-1">Answered on {new Date(a.timestamp).toLocaleString()}</div>
        </li>
      ))}
    </ul>
  );
};

export default ReflectionAnswerList;