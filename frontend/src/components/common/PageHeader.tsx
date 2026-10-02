import React from 'react';
import { LucideIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  backUrl?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  backUrl,
  onBack,
  actions,
  badge,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  const showBackButton = Boolean(backUrl || onBack);

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 ${className}`}>
      <div className="flex items-center gap-3.5">
        {showBackButton && (
          <button
            type="button"
            onClick={handleBack}
            className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 shadow-xs transition"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {Icon && (
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 dark:from-blue-600 dark:to-blue-400 flex items-center justify-center text-white shadow-md shadow-brand-500/25 border border-brand-300/30 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && (
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
};
export default PageHeader;
