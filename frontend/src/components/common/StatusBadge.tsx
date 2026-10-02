import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'LUNAS'
  | 'SEBAGIAN DIBAYAR'
  | 'SEBAGIAN'
  | 'BELUM BAYAR'
  | 'DRAFT'
  | 'DISETUJUI'
  | 'DITOLAK'
  | 'BATAL'
  | 'AKTIF'
  | 'NONAKTIF'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const norm = (status || '').toUpperCase().trim();

  let colorClasses = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  let dotColor = 'bg-slate-400';

  if (norm === 'LUNAS' || norm === 'DISETUJUI' || norm === 'AKTIF' || norm === 'COMPLETED') {
    colorClasses = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
    dotColor = 'bg-emerald-500';
  } else if (norm === 'SEBAGIAN DIBAYAR' || norm === 'SEBAGIAN' || norm === 'PARTIAL') {
    colorClasses = 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30';
    dotColor = 'bg-blue-500';
  } else if (norm === 'BELUM BAYAR' || norm === 'PENDING' || norm === 'MENUNGGU') {
    colorClasses = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30';
    dotColor = 'bg-amber-500';
  } else if (norm === 'DITOLAK' || norm === 'BATAL' || norm === 'VOID' || norm === 'FAILED') {
    colorClasses = 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30';
    dotColor = 'bg-rose-500';
  } else if (norm === 'DRAFT') {
    colorClasses = 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25';
    dotColor = 'bg-slate-400';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border shadow-xs transition-colors",
        sizeClasses,
        colorClasses,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
      {status}
    </span>
  );
};
