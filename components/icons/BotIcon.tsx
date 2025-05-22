
import React from 'react';

// Corrected: Renamed the initial placeholder icon to avoid conflict
const _PlaceholderBotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5M19.5 8.25H18m0 7.5h1.5m-4.5 3.75V21m-3-18V21a6 6 0 0012 0V3M3 3h18M3 21h18" />
     {/* A better Bot icon (e.g. a robot head) */}
  </svg>
);
// Corrected: Directly export the intended icon as BotIcon
 export const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
    <path d="M12 5c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3zm0 4c-.551 0-1-.449-1-1s.449-1 1-1 1 .449 1 1-.449 1-1 1z"/>
    <path d="M12 13c-2.757 0-5 2.243-5 5h10c0-2.757-2.243-5-5-5zm0 1c2.206 0 4 1.794 4 4H8c0-2.206 1.794-4 4-4z"/>
  </svg>
);
// Corrected: Removed the alias export
// export { BetterBotIcon as BotIcon };