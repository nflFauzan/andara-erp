import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  helperText,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        <span>{label}</span>
        {required && (
          <span className="text-rose-500 font-black text-xs" title="Wajib Diisi">*</span>
        )}
      </label>

      <div className="relative">
        {children}
      </div>

      {helperText && !error && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal pl-0.5">
          {helperText}
        </p>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 mt-1 pl-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;
