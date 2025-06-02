import React from 'react';
import { CodeMetrics } from '../services/codeAnalysisService';

interface CodeMetricsDashboardProps {
  metrics: CodeMetrics;
}

export const CodeMetricsDashboard: React.FC<CodeMetricsDashboardProps> = ({ metrics }) => {
  const renderQualityMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(metrics.quality).map(([key, value]) => (
        <div key={key} className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-300 capitalize">{key}</h3>
          <div className="mt-2">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-200 bg-blue-900">
                    {value}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-600">
                <div
                  style={{ width: `${value}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDuplicationMetrics = () => (
    <div className="bg-gray-700 p-4 rounded-lg mt-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">Code Duplication</h3>
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-300">Overall Duplication</span>
        <span className="text-2xl font-bold text-blue-400">{metrics.duplication.percentage}%</span>
      </div>
      {metrics.duplication.duplicatedBlocks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Duplicated Blocks:</h4>
          {metrics.duplication.duplicatedBlocks.map((block, index) => (
            <div key={index} className="bg-gray-600 p-2 rounded">
              <div className="text-sm text-gray-300">
                Lines {block.startLine}-{block.endLine}
              </div>
              <div className="text-xs text-gray-400">
                Duplicate of: {block.duplicateOf}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTestCoverage = () => (
    <div className="bg-gray-700 p-4 rounded-lg mt-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">Test Coverage</h3>
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-300">Estimated Coverage</span>
        <span className="text-2xl font-bold text-blue-400">{metrics.testCoverage.estimatedCoverage}%</span>
      </div>
      {metrics.testCoverage.criticalPaths.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Critical Paths:</h4>
          <ul className="list-disc list-inside text-sm text-gray-400">
            {metrics.testCoverage.criticalPaths.map((path, index) => (
              <li key={index}>{path}</li>
            ))}
          </ul>
        </div>
      )}
      {metrics.testCoverage.suggestedTests.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Suggested Tests:</h4>
          <ul className="list-disc list-inside text-sm text-gray-400">
            {metrics.testCoverage.suggestedTests.map((test, index) => (
              <li key={index}>{test}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderPerformanceMetrics = () => (
    <div className="bg-gray-700 p-4 rounded-lg mt-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">Performance Analysis</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-300">Time Complexity</h4>
          <p className="text-blue-400 font-mono">{metrics.performance.timeComplexity}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-300">Space Complexity</h4>
          <p className="text-blue-400 font-mono">{metrics.performance.spaceComplexity}</p>
        </div>
      </div>
      {metrics.performance.bottlenecks.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Performance Bottlenecks:</h4>
          <div className="space-y-2">
            {metrics.performance.bottlenecks.map((bottleneck, index) => (
              <div key={index} className="bg-gray-600 p-2 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{bottleneck.location}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    bottleneck.impact === 'high' ? 'bg-red-900 text-red-200' :
                    bottleneck.impact === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                    'bg-green-900 text-green-200'
                  }`}>
                    {bottleneck.impact.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{bottleneck.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-100">Code Metrics Dashboard</h2>
      {renderQualityMetrics()}
      {renderDuplicationMetrics()}
      {renderTestCoverage()}
      {renderPerformanceMetrics()}
    </div>
  );
}; 