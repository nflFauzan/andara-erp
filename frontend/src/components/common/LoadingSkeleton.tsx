import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 5,
  className = '',
}) => {
  return (
    <div className={`space-y-3.5 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-2 rounded-xl bg-neu-canvas shadow-neu-inset-xs border border-neu-border/50">
          <div className="h-4 bg-slate-300/60 dark:bg-slate-700/60 rounded-lg w-1/4"></div>
          <div className="h-4 bg-slate-300/60 dark:bg-slate-700/60 rounded-lg w-1/2"></div>
          <div className="h-4 bg-slate-300/60 dark:bg-slate-700/60 rounded-lg w-1/6"></div>
          <div className="h-4 bg-slate-300/60 dark:bg-slate-700/60 rounded-lg w-1/12"></div>
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-neu-surface p-5 rounded-2xl border border-neu-border shadow-neu-convex-md space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-3 bg-slate-300/60 dark:bg-slate-700/60 rounded-md w-1/2"></div>
            <div className="w-9 h-9 rounded-xl bg-neu-canvas shadow-neu-inset-xs"></div>
          </div>
          <div className="h-7 bg-slate-300/60 dark:bg-slate-700/60 rounded-md w-3/4"></div>
          <div className="h-3 bg-slate-300/40 dark:bg-slate-700/40 rounded-md w-1/3"></div>
        </div>
      ))}
    </div>
  );
};
