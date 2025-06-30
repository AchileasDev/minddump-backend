import React from 'react';
import WordCloud from 'react-d3-cloud';

const data = [
  { text: 'anxiety', value: 1000 },
  { text: 'peace', value: 800 },
  { text: 'stress', value: 600 },
  { text: 'hope', value: 400 },
  { text: 'growth', value: 200 }
];

const fontSizeMapper = (word: { value: number }) => Math.log2(word.value) * 5;

const KeywordCloud = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Keyword Cloud</h2>
      <WordCloud
        data={data}
        fontSize={fontSizeMapper}
        rotate={0}
        padding={2}
      />
    </div>
  );
};

export default KeywordCloud; 