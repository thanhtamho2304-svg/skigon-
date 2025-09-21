
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500 mx-auto"></div>
      <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">{message}</p>
    </div>
  );
};

export default Loader;
