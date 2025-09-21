export enum Language {
  EN = 'en',
  VI = 'vi',
}

export type AppState = 'idle' | 'loading' | 'tableOfContents' | 'quiz' | 'results' | 'error';

export type QuizLength = 15 | 25 | 40 | 50;

export interface QuizItem {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export type UserAnswers = {
  [key: number]: number; // key: questionIndex, value: selectedOptionIndex
};

export interface TranslationSet {
  title: string;
  subtitle: string;
  uploadInstruction: string;
  uploadButton: string;
  generateButton: string;
  loaderText: string;
  finishQuizButton: string;
  nextQuestionButton: string;
  resultsTitle: string;
  score: (correct: number, total: number) => string;
  question: (index: number) => string;
  yourAnswer: string;
  correctAnswer: string;
  explanation: string;
  tryAnotherPageButton: string;
  errorTitle: string;
  errorNoQuiz: string;
  errorUnexpected: string;
  errorDocxNotSupported: (filenames: string) => string;
  tryAgainButton: string;
  correct: string;
  incorrect: string;
  imagePreview: string;
  addImage: string;
  changeImages: string;
  maxQuestionsLabel: string;
  timerLabel: string;
  regenerateQuizButton: string;
  timeUpMessage: string;
  
  // Table of Contents View
  tocTitle: string;
  tocInstruction: string;
  selectAllButton: string;
  deselectAllButton: string;
  generateQuizFromTocButton: string;
  tocLoaderText: string;
  quizLoaderText: string;
  generateTocButton: string;

  // Text Input View
  inputModeFileTab: string;
  inputModeTextTab: string;
  textInputPlaceholder: string;
  generateFromTextButton: string;
}