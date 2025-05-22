
import React from 'react';

// Standard PR icon (usually for open)
export const PullRequestIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M1.5 3.25a2.25 2.25 0 113 2.122V7.5A2.5 2.5 0 007 10h1.5V8.53a2.25 2.25 0 111.5 0V10A2.5 2.5 0 0012.5 7.5v-2.128a2.251 2.251 0 111.5 0V7.5a4 4 0 01-4 4H7a4 4 0 01-4-4V5.372A2.25 2.25 0 011.5 3.25zM3 4.5a.75.75 0 100-1.5.75.75 0 000 1.5zM11.5 6a.75.75 0 10-1.5 0 .75.75 0 001.5 0z"></path>
  </svg>
);

// Git Merge icon (for merged PRs)
// Corrected: Renamed the placeholder/incorrect icon
const _PlaceholderGitMergeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M2.5 0A2.5 2.5 0 000 2.5v11A2.5 2.5 0 002.5 16h11a2.5 2.5 0 002.5-2.5v-11A2.5 2.5 0 0013.5 0h-11zM1 2.5A1.5 1.5 0 012.5 1h11A1.5 1.5 0 0115 2.5v11a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 011 13.5v-11z"></path>
    <path d="M8.25 2.25a.75.75 0 00-1.5 0v8.78L4.692 8.692a.75.75 0 00-1.061 1.06L6.75 12.868a.75.75 0 001.061 0l3.119-3.118a.75.75 0 10-1.06-1.06L7.75 11.028V2.25z"></path> {/* This is actually a download icon. Needs proper GitMerge icon */}
  </svg>
);
// Corrected: Directly export the intended icon as GitMergeIcon
export const GitMergeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M1.5 3.25a2.25 2.25 0 113 2.122V10A2.5 2.5 0 007 12.5h1.5V9.717a2.251 2.251 0 111.5 0V12.5A2.5 2.5 0 0012.5 10V5.372a2.25 2.25 0 111.5 0v4.878a4 4 0 01-4 4H7a4 4 0 01-4-4V5.372A2.25 2.25 0 011.5 3.25zM3 4.5a.75.75 0 100-1.5.75.75 0 000 1.5zM11.5 6a.75.75 0 10-1.5 0 .75.75 0 001.5 0z"></path>
  </svg>
);
// Corrected: Removed alias export
// export { RealGitMergeIcon as GitMergeIcon };


// Check Circle (can be used for merged or successful states)
export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// X Circle (can be used for closed/rejected PRs)
export const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);