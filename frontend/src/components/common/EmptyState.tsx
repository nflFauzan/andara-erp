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
    <div className={`p-10 flex flex-col items-center justify-center text-center rounded-2xl bg-neu-canvas shadow-neu-inset-sm border border-slate-300/40 dark:border-slate-800/40 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-neu-surface shadow-neu-convex-sm flex items-center justify-center text-brand-600 dark:text-blue-400 mb-4 border border-neu-border">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-black text-slate-800 dark:text-slate-100">{title}</h3>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 neu-btn-primary"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
