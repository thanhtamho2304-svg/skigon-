import React, { useState } from 'react';
import { QuizItem, UserAnswers, TranslationSet } from '../types';

interface QuizViewProps {
  quiz: QuizItem[];
  onSubmit: (answers: UserAnswers) => void;
  t: TranslationSet;
  timeLeft: number;
  isTimerActive: boolean;
  onStartTimer: () => void;
}

const formatTime = (seconds: number) => {
  if (seconds < 0) seconds = 0;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const QuizView: React.FC<QuizViewProps> = ({ quiz, onSubmit, t, timeLeft, isTimerActive, onStartTimer }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});

  const currentQuestion = quiz[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex];
  const hasAnswered = selectedAnswer !== undefined;

  const handleOptionSelect = (optionIndex: number) => {
    if (hasAnswered) return; // Don't allow changing answer

    if (!isTimerActive) {
      onStartTimer();
    }

    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Last question, submit to see results view
      onSubmit(answers);
    }
  };

  const getOptionClasses = (optionIndex: number) => {
    if (!hasAnswered) {
      return 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer';
    }
    
    const isCorrect = optionIndex === currentQuestion.correctOptionIndex;
    const isSelected = optionIndex === selectedAnswer;

    if (isCorrect) {
      return 'border-green-500 bg-green-100 dark:bg-green-900/50 cursor-default';
    }
    if (isSelected && !isCorrect) {
      return 'border-red-500 bg-red-100 dark:bg-red-900/50 cursor-default';
    }
    
    return 'border-gray-200 dark:border-gray-600 cursor-default opacity-60';
  };

  return (
    <div className="w-full max-w-3xl p-4 sm:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-transform duration-500">
      {/* Question Content */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            <span className="text-indigo-600 dark:text-indigo-400">{t.question(currentQuestionIndex)}</span>
          </h3>
          <div className="flex flex-col items-end">
             <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{`${currentQuestionIndex + 1} / ${quiz.length}`}</span>
             {isTimerActive && (
                <div className="mt-1 flex items-center text-red-500 dark:text-red-400 font-mono" aria-label={t.timerLabel}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{timeLeft > 0 ? formatTime(timeLeft) : t.timeUpMessage}</span>
                </div>
            )}
          </div>
        </div>
        <p className="text-lg text-gray-800 dark:text-gray-200">{currentQuestion.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {currentQuestion.options.map((option, oIndex) => (
          <div
            key={oIndex}
            onClick={() => handleOptionSelect(oIndex)}
            className={`flex items-center p-4 border-2 rounded-lg transition-all duration-200 ${getOptionClasses(oIndex)}`}
            aria-disabled={hasAnswered}
            role="button"
            tabIndex={hasAnswered ? -1 : 0}
          >
            <span className="text-gray-700 dark:text-gray-300">{option}</span>
          </div>
        ))}
      </div>
      
      {/* Feedback and Next Button */}
      {hasAnswered && (
        <div className="mt-6">
          <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-md">
            <p className="font-semibold text-gray-700 dark:text-gray-300">{t.explanation}</p>
            <p className="text-gray-600 dark:text-gray-400">{currentQuestion.explanation}</p>
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-10 py-3 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              {currentQuestionIndex < quiz.length - 1 ? t.nextQuestionButton : t.finishQuizButton}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizView;