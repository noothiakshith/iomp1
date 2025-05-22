
import React from 'react';
import type { Issue } from '../types';
import { IssueOpenedIcon, IssueClosedIcon } from './icons/IssueOpenedIcon'; // IssueClosedIcon to be created
import { UserIcon } from './icons/UserIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { formatDistanceToNowStrict } from 'date-fns';

interface IssueListItemProps {
  issue: Issue;
}

export const IssueListItem: React.FC<IssueListItemProps> = ({ issue }) => {
  const stateColor = issue.state === 'open' ? 'text-green-400' : 'text-red-400';
  const StateIcon = issue.state === 'open' ? IssueOpenedIcon : IssueClosedIcon;

  return (
    <div className="p-3 bg-gray-700 rounded-md shadow hover:bg-gray-650 transition-colors duration-150">
      <div className="flex items-start">
        <StateIcon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${stateColor}`} />
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between">
            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium text-sm truncate"
            >
              {issue.title}
            </a>
             <a href={issue.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-gray-400 hover:text-indigo-400 flex-shrink-0">
                 <ExternalLinkIcon className="w-4 h-4"/>
             </a>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            <span>#{issue.number} opened {formatDistanceToNowStrict(new Date(issue.date), { addSuffix: true })} by </span>
            <UserIcon className="w-3.5 h-3.5 inline-block mx-0.5 text-gray-500 relative -top-px" />
            <span>{issue.user}</span>
          </div>
          {issue.labels && issue.labels.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {issue.labels.map(label => (
                <span
                  key={label.name}
                  className="px-1.5 py-0.5 text-xs rounded-full"
                  style={{ backgroundColor: `#${label.color}`, color: getContrastColor(label.color) }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper to determine text color based on background
function getContrastColor(hexColor: string): string {
  if (!hexColor) return '#000000';
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#FFFFFF';
}

