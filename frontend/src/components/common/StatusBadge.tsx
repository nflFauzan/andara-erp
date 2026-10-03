import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'LUNAS'
  | 'SEBAGIAN DIBAYAR'
  | 'SEBAGIAN'
  | 'BELUM BAYAR'
  | 'DRAFT'
  | 'DISETUJUI'
  | 'APPROVED'
  | 'SENT'
  | 'DIAJUKAN'
  | 'DITOLAK'
  | 'REJECTED'
  | 'BATAL'
  | 'CANCELLED'
  | 'AKTIF'
  | 'NONAKTIF'
  | 'ISSUED'
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

  let colorClasses = 'bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  let dotColor = 'bg-slate-400';

  if (norm === 'LUNAS' || norm === 'DISETUJUI' || norm === 'APPROVED' || norm === 'AKTIF' || norm === 'COMPLETED' || norm === 'PAID') {
    colorClasses = 'bg-emerald-50/90 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30';
    dotColor = 'bg-emerald-500';
  } else if (norm === 'SEBAGIAN DIBAYAR' || norm === 'SEBAGIAN' || norm === 'PARTIAL' || norm === 'SENT' || norm === 'DIAJUKAN' || norm === 'ISSUED') {
    colorClasses = 'bg-blue-50/90 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30';
    dotColor = 'bg-blue-500';
  } else if (norm === 'BELUM BAYAR' || norm === 'UNPAID' || norm === 'PENDING' || norm === 'MENUNGGU') {
    colorClasses = 'bg-amber-50/90 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30';
    dotColor = 'bg-amber-500';
  } else if (norm === 'DITOLAK' || norm === 'REJECTED' || norm === 'BATAL' || norm === 'CANCELLED' || norm === 'VOID' || norm === 'FAILED') {
    colorClasses = 'bg-rose-50/90 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30';
    dotColor = 'bg-rose-500';
  } else if (norm === 'DRAFT') {
    colorClasses = 'bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600';
    dotColor = 'bg-slate-400';
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border-[1.5px] shadow-xs transition-colors",
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
export default StatusBadge;
