
import React from 'react';
import { Language, TranslationSet } from '../types';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationSet;
}

const LanguageSelector: React.FC<{ language: Language, setLanguage: (lang: Language) => void }> = ({ language, setLanguage }) => {
  return (
    <div className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-full">
      <button
        onClick={() => setLanguage(Language.VI)}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${language === Language.VI ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}
      >
        VI
      </button>
      <button
        onClick={() => setLanguage(Language.EN)}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${language === Language.EN ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}
      >
        EN
      </button>
    </div>
  );
};


const Header: React.FC<HeaderProps> = ({ language, setLanguage, t }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600 dark:text-indigo-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t.title}</h1>
        </div>
        <LanguageSelector language={language} setLanguage={setLanguage} />
      </div>
    </header>
  );
};

export default Header;
