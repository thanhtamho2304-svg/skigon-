import React, { useState, useEffect } from 'react';
import { TranslationSet, QuizLength } from '../types';

interface TocViewProps {
  toc: string[];
  onGenerate: (selectedTopics: string[]) => void;
  t: TranslationSet;
  maxQuestions: QuizLength;
  onMaxQuestionsChange: (count: QuizLength) => void;
}

const quizLengthOptions: QuizLength[] = [15, 25, 40, 50];

const TableOfContentsView: React.FC<TocViewProps> = ({ toc, onGenerate, t, maxQuestions, onMaxQuestionsChange }) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Pre-select all topics when the component mounts
  useEffect(() => {
    setSelectedTopics(toc);
  }, [toc]);

  const handleToggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSelectAll = () => setSelectedTopics(toc);
  const handleDeselectAll = () => setSelectedTopics([]);

  const isAllSelected = selectedTopics.length === toc.length;

  return (
    <div className="w-full max-w-2xl p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.tocTitle}</h2>
        <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{t.tocInstruction}</p>
      </div>

      <div className="mb-4 flex justify-end gap-3">
        <button onClick={handleSelectAll} disabled={isAllSelected} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 dark:text-indigo-400 dark:hover:text-indigo-200 dark:disabled:text-gray-500">{t.selectAllButton}</button>
        <button onClick={handleDeselectAll} disabled={selectedTopics.length === 0} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 dark:text-indigo-400 dark:hover:text-indigo-200 dark:disabled:text-gray-500">{t.deselectAllButton}</button>
      </div>

      <div className="max-h-80 overflow-y-auto space-y-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
        {toc.map((topic, index) => (
          <label key={index} className="flex items-center p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={selectedTopics.includes(topic)}
              onChange={() => handleToggleTopic(topic)}
              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-3 text-gray-800 dark:text-gray-200">{topic}</span>
          </label>
        ))}
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <label className="font-semibold text-gray-700 dark:text-gray-300">{t.maxQuestionsLabel}</label>
        <div className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-full">
          {quizLengthOptions.map(count => (
            <button
              key={count}
              onClick={() => onMaxQuestionsChange(count)}
              className={`px-4 py-1 text-sm font-medium rounded-full transition-colors ${
                maxQuestions === count
                  ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => onGenerate(selectedTopics)}
          disabled={selectedTopics.length === 0}
          className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 dark:disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
        >
          {t.generateQuizFromTocButton}
        </button>
      </div>
    </div>
  );
};

export default TableOfContentsView;
