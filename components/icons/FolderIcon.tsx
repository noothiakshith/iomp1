
import React from 'react';

// Corrected: Renamed the initial placeholder to avoid conflict.
const _PlaceholderFolderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    {/* This placeholder icon uses the path for an open folder. */}
     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0A2.25 2.25 0 015.25 7.5h13.5a2.25 2.25 0 012.25 2.25m-16.5 0v1.5A2.25 2.25 0 005.25 13.5h13.5a2.25 2.25 0 002.25-2.25V9.75M9 13.5h6m-6 0V9.75" />
  </svg>
);

// Using Heroicons Folder and FolderOpen
// Corrected: Directly export the intended icon as FolderIcon and updated path
export const FolderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);


export const FolderOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0A2.25 2.25 0 015.25 7.5h13.5a2.25 2.25 0 012.25 2.25m-16.5 0v1.5A2.25 2.25 0 005.25 13.5h13.5a2.25 2.25 0 002.25-2.25V9.75M9 13.5h6m-6 0V9.75" />
  </svg>
);