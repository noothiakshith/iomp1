
import React from 'react';

// Corrected: Renamed placeholder to avoid conflict
const _PlaceholderIssueOpenedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> {/* This is XCircle. Let's use proper issue icons */}
  </svg>
);

// Using Heroicons Issue Open/Closed style
// Corrected: Directly export the intended icon as IssueOpenedIcon
export const IssueOpenedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z"></path>
  </svg>
);
// Corrected: Removed alias export

// Corrected: Renamed placeholder to avoid conflict
const _PlaceholderIssueClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M1.5 8a6.5 6.5 0 0110.65-5.393l-11.043 11.043A6.5 6.5 0 011.5 8zm5.158 5.393l11.043-11.043A6.5 6.5 0 018 14.5c-1.997 0-3.793-.898-4.992-2.323L1.585 13.607A.75.75 0 01.5 13.25v-3.5a.75.75 0 01.75-.75h3.5a.75.75 0 01.53 1.28l-1.185 1.186A4.992 4.992 0 008 13a5 5 0 003.24-1.142L5.957 6.72A6.5 6.5 0 011.5 8a6.48 6.48 0 01.416-2.343L.636 4.377a.75.75 0 011.06-1.06L13.28 10.043A5 5 0 008 3 4.992 4.992 0 003.393 6.658L4.58 5.47a.75.75 0 01-1.06-1.06L1.28 6.65A.75.75 0 011.158 8H8a8 8 0 008-8 .75.75 0 011.5 0A8 8 0 018 8a6.5 6.5 0 01-1.342-.158zM0 8a8 8 0 1116 0A8 8 0 010 8z"></path>
     <path d="M10.28 5.22a.75.75 0 10-1.06 1.06L10.94 8l-1.72 1.72a.75.75 0 101.06 1.06L12 9.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 8l1.72-1.72a.75.75 0 00-1.06-1.06L12 6.94l-1.72-1.72z"></path> {/* Checkmark part for closed */}
  </svg>
);
// A better IssueClosedIcon (like GitHub's - checkmark in circle)

// Corrected: Directly export the intended icon as IssueClosedIcon
 export const IssueClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 16 16" version="1.1" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M7.71 10.22a.75.75 0 011.06-1.06L10.5 10.94l3.22-3.22a.75.75 0 011.06 1.06L11.03 12.5l-2.26 2.28a.75.75 0 01-1.06 0L5.47 12.5z"></path>
    <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z"></path>
  </svg>
 );
 // Corrected: Removed alias export
 // export { BetterIssueClosedIcon as IssueClosedIcon };