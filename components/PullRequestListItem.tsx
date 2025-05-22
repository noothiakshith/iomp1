
import React from 'react';
import type { PullRequest } from '../types';
import { PullRequestIcon, GitMergeIcon, CheckCircleIcon, XCircleIcon } from './icons/PullRequestIcon'; // Other icons may need creation
import { UserIcon } from './icons/UserIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { formatDistanceToNowStrict } from 'date-fns';

interface PullRequestListItemProps {
  pr: PullRequest;
}

export const PullRequestListItem: React.FC<PullRequestListItemProps> = ({ pr }) => {
  let StateIconComponent;
  let stateColorClass = '';

  switch (pr.state) {
    case 'open':
      StateIconComponent = PullRequestIcon; // Assuming PullRequestIcon is for open PRs
      stateColorClass = 'text-green-400';
      break;
    case 'closed':
      StateIconComponent = XCircleIcon; // Placeholder, create this
      stateColorClass = 'text-red-400';
      break;
    case 'merged':
      StateIconComponent = GitMergeIcon; // Placeholder, create this
      stateColorClass = 'text-purple-400';
      break;
    default:
      StateIconComponent = PullRequestIcon;
      stateColorClass = 'text-gray-400';
  }


  return (
    <div className="p-3 bg-gray-700 rounded-md shadow hover:bg-gray-650 transition-colors duration-150">
      <div className="flex items-start">
        <StateIconComponent className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${stateColorClass}`} />
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between">
            <a
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium text-sm truncate"
            >
              {pr.title}
            </a>
             <a href={pr.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-gray-400 hover:text-indigo-400 flex-shrink-0">
                 <ExternalLinkIcon className="w-4 h-4"/>
             </a>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            <span>#{pr.number} opened {formatDistanceToNowStrict(new Date(pr.date), { addSuffix: true })} by </span>
            <UserIcon className="w-3.5 h-3.5 inline-block mx-0.5 text-gray-500 relative -top-px" />
            <span>{pr.user}</span>
            <span className={`ml-2 capitalize font-medium ${stateColorClass}`}>({pr.state})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
