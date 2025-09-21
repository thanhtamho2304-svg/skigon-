import React, { useRef } from 'react';
import { TranslationSet, QuizLength } from '../types';

interface ImageUploaderProps {
  onAddImages: (files: FileList | null) => void;
  onChangeImages: (files: FileList | null) => void;
  onGenerate: () => void;
  imagePreviews: string[];
  onRemoveImage: (index: number) => void;
  isGenerating: boolean;
  t: TranslationSet;
  maxQuestions: QuizLength;
  onMaxQuestionsChange: (count: QuizLength) => void;
}

const quizLengthOptions: QuizLength[] = [15, 25, 40, 50];


const PDFPreview: React.FC<{ fileName: string }> = ({ fileName }) => (
    <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md p-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-red-500 dark:text-red-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
      <p className="text-xs text-center font-medium text-gray-600 dark:text-gray-300 mt-2 break-all">{fileName}</p>
    </div>
);

const DOCXPreview: React.FC<{ fileName: string }> = ({ fileName }) => (
    <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md p-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-blue-500 dark:text-blue-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
      <p className="text-xs text-center font-medium text-gray-600 dark:text-gray-300 mt-2 break-all">{fileName}</p>
    </div>
);

const FilePreview: React.FC<{ fileName: string }> = ({ fileName }) => (
    <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md p-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-500 dark:text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
      <p className="text-xs text-center font-medium text-gray-600 dark:text-gray-300 mt-2 break-all">{fileName}</p>
    </div>
);


const ImageUploader: React.FC<ImageUploaderProps> = ({ onAddImages, onChangeImages, onGenerate, imagePreviews, onRemoveImage, isGenerating, t, maxQuestions, onMaxQuestionsChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMode = useRef<'add' | 'change'>('change');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (uploadMode.current === 'add') {
      onAddImages(files);
    } else {
      onChangeImages(files);
    }
    // Reset the input value to allow selecting the same file(s) again
    if(event.target) {
        event.target.value = '';
    }
  };

  const handleAddClick = () => {
    uploadMode.current = 'add';
    fileInputRef.current?.click();
  };
  
  const handleChangeClick = () => {
    uploadMode.current = 'change';
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
      </div>

      <input 
        ref={fileInputRef} 
        type="file" 
        className="hidden" 
        accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
        multiple 
        onChange={handleFileChange} 
      />

      {imagePreviews.length === 0 ? (
        <div 
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={handleChangeClick}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-10 h-10 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h1.586A3 3 0 0113.414 3.586L15 5h3a4 4 0 014 4v5a4 4 0 01-4 4H7z"></path></svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">{t.uploadInstruction}</span></p>
            <p className="text-xs text-gray-500 dark:text-gray-400">DOCX, PDF, PNG, JPG, WEBP</p>
          </div>
        </div>
      ) : (
        <div className="w-full">
            <h3 className="text-lg text-center font-semibold mb-4 dark:text-gray-200">{t.imagePreview} ({imagePreviews.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                        {preview.startsWith('pdf:') ? (
                            <PDFPreview fileName={preview.substring(4)} />
                        ) : preview.startsWith('docx:') ? (
                            <DOCXPreview fileName={preview.substring(5)} />
                        ) : preview.startsWith('file:') ? (
                            <FilePreview fileName={preview.substring(5)} />
                        ) : (
                            <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg shadow-md"/>
                        )}
                        <button
                            onClick={() => onRemoveImage(index)}
                            className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 leading-none opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                            aria-label={`Remove image ${index + 1}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
            <div className="text-center flex justify-center gap-4">
                <button
                    onClick={handleAddClick}
                    className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                    {t.addImage}
                </button>
                 <button
                    onClick={handleChangeClick}
                    className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                    {t.changeImages}
                </button>
            </div>
        </div>
      )}
      
      {/* The max questions selector is now moved to the TableOfContentsView */}

      <div className="mt-6 text-center">
        <button
          onClick={onGenerate}
          disabled={imagePreviews.length === 0 || isGenerating}
          className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 dark:disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
        >
          {isGenerating ? t.tocLoaderText : t.generateTocButton}
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;
