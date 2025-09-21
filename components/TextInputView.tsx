import React, { useState } from 'react';
import { TranslationSet, QuizLength } from '../types';

interface TextInputViewProps {
  onGenerate: (text: string) => void;
  t: TranslationSet;
  maxQuestions: QuizLength;
  onMaxQuestionsChange: (count: QuizLength) => void;
  initialText: string;
  onTextChange: (text: string) => void;
}

const quizLengthOptions: QuizLength[] = [15, 25, 40, 50];

const TextInputView: React.FC<TextInputViewProps> = ({ onGenerate, t, maxQuestions, onMaxQuestionsChange, initialText, onTextChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateClick = () => {
    setIsGenerating(true);
    // The parent's state change will ultimately re-render,
    // so we don't need to set isGenerating back to false here.
    onGenerate(initialText);
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
      </div>

      <textarea
        value={initialText}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={t.textInputPlaceholder}
        className="w-full h-64 p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        aria-label={t.textInputPlaceholder}
      />
      
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
          onClick={handleGenerateClick}
          disabled={!initialText.trim() || isGenerating}
          className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 dark:disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
        >
          {isGenerating ? t.loaderText : t.generateFromTextButton}
        </button>
      </div>
    </div>
  );
};

export default TextInputView;