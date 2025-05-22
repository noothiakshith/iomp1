
import React from 'react';
import type { Contributor } from '../types';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface ContributorListItemProps {
  contributor: Contributor;
}

export const ContributorListItem: React.FC<ContributorListItemProps> = ({ contributor }) => {
  return (
    <div className="p-4 bg-gray-700 rounded-lg shadow flex flex-col items-center text-center hover:bg-gray-650 transition-colors duration-150">
      <img
        src={contributor.avatarUrl || `https://i.pravatar.cc/80?u=${contributor.login}`} // Fallback avatar
        alt={contributor.login}
        className="w-16 h-16 rounded-full mb-3 border-2 border-gray-500"
      />
      <a
        href={contributor.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold text-sm truncate max-w-full"
      >
        {contributor.login}
      </a>
      <p className="text-xs text-gray-400 mt-1">{contributor.contributions.toLocaleString()} contributions</p>
      <a
        href={contributor.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 text-gray-500 hover:text-indigo-400 transition-colors"
        title={`View ${contributor.login} on GitHub`}
      >
        <ExternalLinkIcon className="w-4 h-4" />
      </a>
    </div>
  );
};
