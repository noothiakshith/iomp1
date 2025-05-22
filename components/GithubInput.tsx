
import React, { useState } from 'react';
import { GithubIcon } from './icons/GithubIcon'; 
import { LoadingSpinner } from './LoadingSpinner';

interface GithubInputProps {
  onFetch: (url: string) => void;
  isLoading: boolean;
}

export const GithubInput: React.FC<GithubInputProps> = ({ onFetch, isLoading }) => {
  const [url, setUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!url.trim()) {
      setError("Please enter a GitHub repository URL.");
      return;
    }
    // Basic validation for GitHub URL pattern
    if (!url.match(/^(https|http):\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+(\/)?$/)) {
        setError("Invalid GitHub URL. Example: https://github.com/owner/repo");
        return;
    }
    onFetch(url);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-grow w-full flex items-center bg-gray-700 rounded-md focus-within:ring-2 focus-within:ring-indigo-500">
          <GithubIcon className="h-6 w-6 mx-3 text-gray-400" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter GitHub Repository URL (e.g., https://github.com/owner/repo)"
            className="w-full p-3 bg-transparent text-gray-100 placeholder-gray-500 focus:outline-none rounded-md"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-md transition-colors duration-150 ease-in-out flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Analyzing...</span>
            </>
          ) : (
            'Analyze Repository'
          )}
        </button>
      </form>
      {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
    </div>
  );
};
