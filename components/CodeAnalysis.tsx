import React, { useState } from 'react';
import { analyzeCode, CodeAnalysisResult } from '../services/codeAnalysisService';
import { CodeMetricsDashboard } from './CodeMetricsDashboard';

export const CodeAnalysis: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('JavaScript');
  const [analysis, setAnalysis] = useState<CodeAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'complexity' | 'security' | 'style' | 'documentation' | 'metrics'>('complexity');

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeCode(code, language);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze code');
    } finally {
      setIsLoading(false);
    }
  };

  const renderComplexityTab = () => {
    if (!analysis) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="text-4xl font-bold text-blue-400">{analysis.complexity.score}</div>
          <div className="text-sm text-gray-400">Complexity Score (1-10)</div>
        </div>
        <div className="bg-gray-700 p-4 rounded border border-gray-600">
          <h4 className="text-lg font-semibold mb-2 text-gray-200">Explanation</h4>
          <p className="text-gray-300 whitespace-pre-wrap">{analysis.complexity.explanation}</p>
        </div>
        {analysis.complexity.suggestions.length > 0 && (
          <div className="bg-gray-700 p-4 rounded border border-gray-600">
            <h4 className="text-lg font-semibold mb-2 text-gray-200">Suggestions</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              {analysis.complexity.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderSecurityTab = () => {
    if (!analysis) return null;
    return (
      <div className="space-y-4">
        <div className="bg-gray-700 p-4 rounded border border-gray-600">
          <h4 className="text-lg font-semibold mb-2 text-gray-200">Summary</h4>
          <p className="text-gray-300 whitespace-pre-wrap">{analysis.security.summary}</p>
        </div>
        {analysis.security.vulnerabilities.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-200">Vulnerabilities</h4>
            {analysis.security.vulnerabilities.map((vuln, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded border border-gray-600">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    vuln.severity === 'high' ? 'bg-red-900 text-red-200' :
                    vuln.severity === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                    'bg-green-900 text-green-200'
                  }`}>
                    {vuln.severity.toUpperCase()}
                  </span>
                  {vuln.lineNumber && (
                    <span className="text-sm text-gray-400">Line {vuln.lineNumber}</span>
                  )}
                </div>
                <p className="text-gray-300 mb-2">{vuln.description}</p>
                {vuln.fix && (
                  <div className="mt-2">
                    <span className="text-sm font-semibold text-gray-200">Suggested Fix:</span>
                    <p className="text-gray-300 mt-1">{vuln.fix}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderStyleTab = () => {
    if (!analysis) return null;
    return (
      <div className="space-y-4">
        <div className="bg-gray-700 p-4 rounded border border-gray-600">
          <h4 className="text-lg font-semibold mb-2 text-gray-200">Summary</h4>
          <p className="text-gray-300 whitespace-pre-wrap">{analysis.style.summary}</p>
        </div>
        {analysis.style.issues.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-200">Issues and Suggestions</h4>
            {analysis.style.issues.map((issue, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded border border-gray-600">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    issue.type === 'warning' ? 'bg-yellow-900 text-yellow-200' : 'bg-blue-900 text-blue-200'
                  }`}>
                    {issue.type.toUpperCase()}
                  </span>
                  {issue.lineNumber && (
                    <span className="text-sm text-gray-400">Line {issue.lineNumber}</span>
                  )}
                </div>
                <p className="text-gray-300 mb-2">{issue.description}</p>
                {issue.fix && (
                  <div className="mt-2">
                    <span className="text-sm font-semibold text-gray-200">Suggested Fix:</span>
                    <p className="text-gray-300 mt-1">{issue.fix}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDocumentationTab = () => {
    if (!analysis) return null;
    return (
      <div className="space-y-6">
        <div className="bg-gray-700 p-4 rounded border border-gray-600">
          <h4 className="text-lg font-semibold mb-2 text-gray-200">Overview</h4>
          <p className="text-gray-300 whitespace-pre-wrap">{analysis.documentation.overview}</p>
        </div>
        {analysis.documentation.functions.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-200">Functions</h4>
            {analysis.documentation.functions.map((func, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded border border-gray-600">
                <h5 className="text-lg font-semibold text-blue-400">{func.name}</h5>
                <p className="text-gray-300 mt-2">{func.description}</p>
                {func.parameters && func.parameters.length > 0 && (
                  <div className="mt-4">
                    <h6 className="text-sm font-semibold text-gray-200">Parameters:</h6>
                    <ul className="mt-2 space-y-2">
                      {func.parameters.map((param, pIndex) => (
                        <li key={pIndex} className="text-gray-300">
                          <span className="font-mono text-blue-400">{param.name}</span>
                          <span className="text-gray-400">: {param.type}</span>
                          <span className="text-gray-300"> - {param.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {func.returnType && (
                  <div className="mt-4">
                    <h6 className="text-sm font-semibold text-gray-200">Returns:</h6>
                    <p className="text-gray-300 mt-1">
                      <span className="font-mono text-blue-400">{func.returnType}</span>
                      <span className="text-gray-300"> - {func.returnDescription}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-100">Code Analysis</h2>
      
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
        <label className="block text-sm font-medium mb-2 text-gray-300">Code to Analyze</label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-48 p-3 bg-gray-700 border border-gray-600 rounded font-mono text-gray-100 focus:outline-none focus:border-blue-500"
          placeholder="Paste your code here..."
        />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={isLoading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Analyzing Code...' : 'Analyze Code'}
      </button>

      {error && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded">
          {error}
        </div>
      )}

      {analysis && (
        <div className="mt-8">
          <div className="flex space-x-4 border-b border-gray-700 mb-6">
            <button
              className={`px-4 py-2 ${activeTab === 'complexity' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('complexity')}
            >
              Complexity
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'security' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'style' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('style')}
            >
              Style
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'documentation' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('documentation')}
            >
              Documentation
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'metrics' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('metrics')}
            >
              Metrics
            </button>
          </div>

          <div className="mt-6">
            {activeTab === 'complexity' && renderComplexityTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'style' && renderStyleTab()}
            {activeTab === 'documentation' && renderDocumentationTab()}
            {activeTab === 'metrics' && <CodeMetricsDashboard metrics={analysis.metrics} />}
          </div>
        </div>
      )}
    </div>
  );
}; 