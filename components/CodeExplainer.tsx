import React, { useState } from 'react';
import { generateCodeExplanation } from '../services/geminiService';

export const CodeExplainer: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('JavaScript');
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = async () => {
    if (!code.trim()) {
      setError('Please enter some code to explain');
      return;
    }

    setIsLoading(true);
    setError(null);
    setExplanation('');

    try {
      const result = await generateCodeExplanation(code, language);
      setExplanation(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate explanation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-100">Code Explainer</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-300">Programming Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
        >
          <option value="JavaScript">JavaScript</option>
          <option value="TypeScript">TypeScript</option>
          <option value="Python">Python</option>
          <option value="Java">Java</option>
          <option value="C++">C++</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-300">Code to Explain</label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-48 p-3 bg-gray-700 border border-gray-600 rounded font-mono text-gray-100 focus:outline-none focus:border-blue-500"
          placeholder="Paste your code here..."
        />
      </div>

      <button
        onClick={handleExplain}
        disabled={isLoading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Generating Explanation...' : 'Explain Code'}
      </button>

      {error && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded">
          {error}
        </div>
      )}

      {explanation && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-100">Explanation:</h3>
          <div className="p-4 bg-gray-700 rounded border border-gray-600 whitespace-pre-wrap text-gray-200">
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
}; 