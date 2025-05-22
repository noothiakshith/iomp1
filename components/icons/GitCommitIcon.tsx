
import React from 'react';

// Corrected: Renamed the initial placeholder icon to avoid conflict
const _SimpleGitCommitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <circle cx="12" cy="12" r="3" />
    <line x1="3" y1="12" x2="9" y2="12" />
    <line x1="15" y1="12" x2="21" y2="12" />
  </svg>
);
// A more standard git commit icon:

// Corrected: Directly export the intended icon as GitCommitIcon
 export const GitCommitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 16 16" version="1.1" fill="currentColor" aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M10.5 7.75a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm1.43.08a.75.75 0 000-1.5l-1.03-.08A4.002 4.002 0 008 3.5a4 4 0 00-3.9 4.25l-1.03.08a.75.75 0 000 1.5l1.03.08A4.002 4.002 0 008 12.5a4 4 0 003.9-4.25l1.03-.08z"></path>
  </svg>
);
// Corrected: Removed the alias export as GitCommitIcon is now directly the BetterGitCommitIcon
// export { BetterGitCommitIcon as GitCommitIcon };