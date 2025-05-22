
import React from 'react';

// Corrected: Renamed the initial complex icon to avoid conflict
const _ComplexUsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.002M2.25 18.72C2.25 17.134 3.484 16 5.02 16h13.96c1.536 0 2.77 1.134 2.77 2.72S20.516 21 18.98 21H5.02C3.484 21 2.25 19.866 2.25 18.72zM12 12.75a4.507 4.507 0 004.5-4.5V4.5A4.507 4.507 0 0012 0a4.507 4.507 0 00-4.5 4.5v3.75a4.507 4.507 0 004.5 4.5zM12 0a4.5 4.5 0 00-4.5 4.5v3.75a4.5 4.5 0 004.5 4.5V12m6.06-7.5A4.5 4.5 0 0012 0m0 12.75a4.5 4.5 0 01-4.5-4.5M12 0a4.5 4.5 0 014.5 4.5m0 0v3.75a4.5 4.5 0 01-4.5 4.5" />
  </svg>
);
// Simpler Users Icon from Heroicons

// Corrected: Directly export the intended icon as UsersIcon
 export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
);
// Corrected: Removed the alias export
// export { SimplerUsersIcon as UsersIcon };