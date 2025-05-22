
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string; // Tailwind color class e.g. text-blue-500
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'text-indigo-400' }) => {
  const sizeClasses = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={`animate-spin rounded-full border-solid border-t-transparent ${sizeClasses[size]} ${color}`}
      style={{ borderTopColor: 'transparent' }} // Ensures Tailwind JIT picks up border-t-transparent
    ></div>
  );
};
