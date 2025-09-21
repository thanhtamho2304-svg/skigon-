import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AppState, Language, QuizItem, UserAnswers, QuizLength } from './types';
import { generateTocFromFiles, generateQuizFromSelection, generateQuizFromText } from './services/geminiService';
import { translations } from './constants/translations';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import Loader from './components/Loader';
import QuizView from './components/QuizView';
import ResultsView from './components/ResultsView';
import TableOfContentsView from './components/TableOfContentsView';
import TextInputView from './components/TextInputView';

const QUIZ_DURATION_SECONDS = 60 * 60; // 60 minutes

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [language, setLanguage] = useState<Language>(Language.VI);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [tableOfContents, setTableOfContents] = useState<string[]>([]);
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [error, setError] = useState<string | null>(null);
  const [maxQuestions, setMaxQuestions] = useState<QuizLength>(50);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isGeneratingToc, setIsGeneratingToc] = useState(false);
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [quizSourceText, setQuizSourceText] = useState<string>('');

  const t = useMemo(() => translations[language], [language]);

  useEffect(() => {
    if (!isTimerActive || appState !== 'quiz') return;

    if (timeLeft <= 0) {
      handleQuizSubmit(userAnswers); // Auto-submit when time is up
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [isTimerActive, timeLeft, appState, userAnswers]);

  const getFileMimeType = (file: File): string => {
    if (file.type) return file.type;
  
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'application/pdf';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'webp': return 'image/webp';
      default: return ''; // Let the caller handle this case.
    }
  };

  const generatePreviews = (files: File[]): string[] => {
    return files.map(file => {
      const mimeType = getFileMimeType(file);
      if (mimeType.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return `docx:${file.name}`;
      }
      if (mimeType === 'application/pdf') {
        return `pdf:${file.name}`;
      }
      return `file:${file.name}`; // Fallback for other document types
    });
  };

  const isSpecialPreview = (preview: string) => 
    preview.startsWith('pdf:') || 
    preview.startsWith('docx:') || 
    preview.startsWith('file:');

  const cleanupPreviews = (previews: string[]) => {
    previews.forEach(p => {
      if (!isSpecialPreview(p)) {
        URL.revokeObjectURL(p);
      }
    });
  };


  const handleAddImages = (files: FileList | null) => {
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setImageFiles(prevFiles => [...prevFiles, ...newFiles]);

      const newPreviews = generatePreviews(newFiles);
      setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    }
  };

  const handleChangeImages = (files: FileList | null) => {
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const newPreviews = generatePreviews(newFiles);
      
      cleanupPreviews(imagePreviews); // Clean up old object URLs
      
      setImageFiles(newFiles);
      setImagePreviews(newPreviews);
    } else {
      cleanupPreviews(imagePreviews);
      setImageFiles([]);
      setImagePreviews([]);
    }
  };


  const handleRemoveImage = (indexToRemove: number) => {
    const urlToRemove = imagePreviews[indexToRemove];
    if (!isSpecialPreview(urlToRemove)) {
      URL.revokeObjectURL(urlToRemove);
    }
    
    setImageFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  };
  
  const fileToGenerativePart = (file: File) => {
    return new Promise<{ mimeType: string; data: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          return reject(new Error('File reader did not return a string.'));
        }
        const mimeType = getFileMimeType(file);
        if (!mimeType) {
          return reject(new Error(`Could not determine file type for: ${file.name}. Please use a supported format.`));
        }
        const base64Data = reader.result.split(',')[1];
        resolve({
          mimeType: mimeType,
          data: base64Data,
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };
  
  const handleGenerateToc = useCallback(async () => {
    if (imageFiles.length === 0) return;

    const docxFiles = imageFiles.filter(file => 
      getFileMimeType(file) === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    if (docxFiles.length > 0) {
      setError(t.errorDocxNotSupported(docxFiles.map(f => f.name).join(', ')));
      setAppState('error');
      return;
    }

    setIsGeneratingToc(true);
    setError(null);
    try {
        const imageParts = await Promise.all(imageFiles.map(file => fileToGenerativePart(file)));
        const toc = await generateTocFromFiles(imageParts, language);
        if (toc && toc.length > 0) {
            setTableOfContents(toc);
            setAppState('tableOfContents');
        } else {
            throw new Error(t.errorNoQuiz);
        }
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : t.errorUnexpected);
        setAppState('error');
    } finally {
        setIsGeneratingToc(false);
    }
  }, [imageFiles, language, t]);

  const handleGenerateQuizFromSelection = useCallback(async (selectedTopics: string[]) => {
    if (selectedTopics.length === 0) {
        return;
    }
    setLoadingMessage(t.quizLoaderText);
    setAppState('loading');
    setError(null);
    setTimeLeft(QUIZ_DURATION_SECONDS);
    setIsTimerActive(false);

    try {
      const imageParts = await Promise.all(imageFiles.map(file => fileToGenerativePart(file)));
      const generatedQuiz = await generateQuizFromSelection(imageParts, language, maxQuestions, selectedTopics);
      if (generatedQuiz && generatedQuiz.length > 0) {
        setQuiz(generatedQuiz);
        setUserAnswers({});
        setAppState('quiz');
      } else {
        throw new Error(t.errorNoQuiz);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t.errorUnexpected);
      setAppState('error');
    }
  }, [imageFiles, language, t, maxQuestions]);

  const handleGenerateQuizFromText = useCallback(async (text: string) => {
    if (!text.trim()) {
        return;
    }
    setQuizSourceText(text); // Persist the text for regeneration
    setLoadingMessage(t.quizLoaderText);
    setAppState('loading');
    setError(null);
    setTimeLeft(QUIZ_DURATION_SECONDS);
    setIsTimerActive(false);

    try {
      const generatedQuiz = await generateQuizFromText(text, language, maxQuestions);
      if (generatedQuiz && generatedQuiz.length > 0) {
        setQuiz(generatedQuiz);
        setUserAnswers({});
        setAppState('quiz');
      } else {
        throw new Error(t.errorNoQuiz);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t.errorUnexpected);
      setAppState('error');
    }
  }, [language, t, maxQuestions]);


  const handleRegenerateQuiz = useCallback(() => {
    if (inputMode === 'file') {
      // Go back to the ToC selection screen
      setAppState('tableOfContents');
    } else {
      // Go back to the text input screen
      setAppState('idle');
    }
      setQuiz([]);
      setUserAnswers({});
      setIsTimerActive(false);
      setTimeLeft(QUIZ_DURATION_SECONDS);
  }, [inputMode]);

  const handleStartTimer = () => {
    if (!isTimerActive) {
      setTimeLeft(QUIZ_DURATION_SECONDS);
      setIsTimerActive(true);
    }
  };

  const handleQuizSubmit = (answers: UserAnswers) => {
    setIsTimerActive(false);
    setUserAnswers(answers);
    setAppState('results');
  };

  const handleReset = () => {
    setAppState('idle');
    cleanupPreviews(imagePreviews);
    setImageFiles([]);
    setImagePreviews([]);
    setTableOfContents([]);
    setQuiz([]);
    setUserAnswers({});
    setError(null);
    setIsTimerActive(false);
    setTimeLeft(QUIZ_DURATION_SECONDS);
    setQuizSourceText('');
    setInputMode('file');
  };

  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return <Loader message={loadingMessage || t.loaderText} />;
      case 'tableOfContents':
        return <TableOfContentsView
                  toc={tableOfContents}
                  onGenerate={handleGenerateQuizFromSelection}
                  t={t}
                  maxQuestions={maxQuestions}
                  onMaxQuestionsChange={setMaxQuestions}
                />;
      case 'quiz':
        return <QuizView 
                  quiz={quiz} 
                  onSubmit={handleQuizSubmit} 
                  t={t}
                  timeLeft={timeLeft}
                  isTimerActive={isTimerActive}
                  onStartTimer={handleStartTimer}
                />;
      case 'results':
        return <ResultsView 
                  quiz={quiz} 
                  userAnswers={userAnswers} 
                  onRetry={handleReset} 
                  t={t}
                  onRegenerate={handleRegenerateQuiz}
                />;
      case 'error':
        return (
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-500 mb-4">{t.errorTitle}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t.tryAgainButton}
            </button>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="w-full max-w-2xl">
            <div className="mb-4 flex justify-center p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
              <button
                onClick={() => setInputMode('file')}
                className={`w-1/2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  inputMode === 'file' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {t.inputModeFileTab}
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`w-1/2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  inputMode === 'text' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {t.inputModeTextTab}
              </button>
            </div>
            {inputMode === 'file' ? (
              <ImageUploader
                onAddImages={handleAddImages}
                onChangeImages={handleChangeImages}
                onGenerate={handleGenerateToc}
                imagePreviews={imagePreviews}
                onRemoveImage={handleRemoveImage}
                isGenerating={isGeneratingToc}
                maxQuestions={maxQuestions}
                onMaxQuestionsChange={setMaxQuestions}
                t={t}
              />
            ) : (
               <TextInputView
                onGenerate={handleGenerateQuizFromText}
                maxQuestions={maxQuestions}
                onMaxQuestionsChange={setMaxQuestions}
                t={t}
                initialText={quizSourceText}
                onTextChange={setQuizSourceText}
              />
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Header language={language} setLanguage={setLanguage} t={t} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;