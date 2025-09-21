import React from 'react';
import { QuizItem, UserAnswers, TranslationSet } from '../types';

interface ResultsViewProps {
  quiz: QuizItem[];
  userAnswers: UserAnswers;
  onRetry: () => void;
  onRegenerate: () => void;
  t: TranslationSet;
}

const ResultsView: React.FC<ResultsViewProps> = ({ quiz, userAnswers, onRetry, onRegenerate, t }) => {
  const score = quiz.reduce((acc, item, index) => {
    return userAnswers[index] === item.correctOptionIndex ? acc + 1 : acc;
  }, 0);

  const getOptionClasses = (qIndex: number, oIndex: number, correctIndex: number) => {
    const isSelected = userAnswers[qIndex] === oIndex;
    const isCorrect = oIndex === correctIndex;

    if (isCorrect) {
      return 'bg-green-100 dark:bg-green-900/50 border-green-500';
    }
    if (isSelected && !isCorrect) {
      return 'bg-red-100 dark:bg-red-900/50 border-red-500';
    }
    return 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600';
  };
  
  const getAnswerStatusIcon = (qIndex: number, correctIndex: number) => {
    const isCorrect = userAnswers[qIndex] === correctIndex;
    if (isCorrect) {
      return (
        <span className="flex items-center text-sm font-semibold text-green-600 dark:text-green-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
           </svg>
           {t.correct}
        </span>
      );
    }
    return (
       <span className="flex items-center text-sm font-semibold text-red-600 dark:text-red-400">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
         </svg>
         {t.incorrect}
       </span>
    );
  }

  return (
    <div className="w-full max-w-3xl p-4 sm:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.resultsTitle}</h2>
        <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">{t.score(score, quiz.length)}</p>
      </div>

      <div className="space-y-6">
        {quiz.map((item, qIndex) => (
          <div key={qIndex} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {t.question(qIndex)}: {item.question}
              </h3>
              {getAnswerStatusIcon(qIndex, item.correctOptionIndex)}
            </div>

            <div className="space-y-2 mb-4">
              {item.options.map((option, oIndex) => (
                <div
                  key={oIndex}
                  className={`flex items-center p-3 border-2 rounded-md ${getOptionClasses(qIndex, oIndex, item.correctOptionIndex)}`}
                >
                  <span className="font-medium text-gray-800 dark:text-gray-200">{option}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-900/50 rounded-md">
                <p className="font-semibold text-gray-700 dark:text-gray-300">{t.explanation}</p>
                <p className="text-gray-600 dark:text-gray-400">{item.explanation}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onRegenerate}
          className="px-6 py-3 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
        >
          {t.regenerateQuizButton}
        </button>
        <button
          onClick={onRetry}
          className="px-8 py-3 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
        >
          {t.tryAnotherPageButton}
        </button>
      </div>
    </div>
  );
};

export default ResultsView;