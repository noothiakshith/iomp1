
import React from 'react';
import { CodeIcon } from './icons/CodeIcon'; // Placeholder, create this icon

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-white flex items-center">
              <CodeIcon className="h-8 w-8 text-indigo-400 mr-2" />
              <span className="font-bold text-xl">GitHub Repo Analyzer AI</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
