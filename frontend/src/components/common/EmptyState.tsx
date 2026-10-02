import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`bento-card flex flex-col items-center justify-center p-10 text-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-blue-500/15 flex items-center justify-center text-brand-600 dark:text-blue-400 mb-4 border border-brand-500/20">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/25 transition active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
