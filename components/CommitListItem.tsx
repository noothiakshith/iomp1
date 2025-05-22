
import React from 'react';
import type { Commit } from '../types';
import { GitCommitIcon } from './icons/GitCommitIcon';
import { UserIcon } from './icons/UserIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon'; // To be created
import { formatDistanceToNowStrict } from 'date-fns';


interface CommitListItemProps {
  commit: Commit;
}

export const CommitListItem: React.FC<CommitListItemProps> = ({ commit }) => {
  return (
    <div className="p-3 bg-gray-700 rounded-md shadow hover:bg-gray-650 transition-colors duration-150">
      <div className="flex items-start justify-between">
        <div className="flex-grow min-w-0">
          <a
            href={commit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium text-sm truncate block"
          >
            {commit.message.split('\n')[0]} {/* Show only first line of message */}
          </a>
          <div className="flex items-center text-xs text-gray-400 mt-1">
            <UserIcon className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            <span>{commit.author}</span>
            <span className="mx-1.5">&bull;</span>
            <span>{formatDistanceToNowStrict(new Date(commit.date), { addSuffix: true })}</span>
          </div>
        </div>
        <div className="flex-shrink-0 ml-2 text-xs text-gray-500 flex items-center">
           <GitCommitIcon className="w-3.5 h-3.5 mr-1 text-gray-500"/>
           <code>{commit.sha.substring(0, 7)}</code>
           <a href={commit.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-gray-400 hover:text-indigo-400">
             <ExternalLinkIcon className="w-4 h-4"/>
           </a>
        </div>
      </div>
      {commit.message.includes('\n') && (
        <p className="text-xs text-gray-300 mt-1 whitespace-pre-wrap">
          {commit.message.substring(commit.message.indexOf('\n') + 1).substring(0,150)}
          {commit.message.length > 150 && '...'}
        </p>
      )}
    </div>
  );
};
