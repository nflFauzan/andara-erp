import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'PLANNED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELLED'
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
  | 'AKTIF'
  | 'NONAKTIF'
  | 'ISSUED'
  | 'CONFIRMED'
  | 'UNPAID'
  | 'PAID'
  | 'PARTIAL'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'md';
}

const FRIENDLY_LABELS: Record<string, string> = {
  // Kegiatan Statuses
  'PLANNED': 'Direncanakan',
  'ACTIVE': 'Berjalan',
  'COMPLETED': 'Selesai',
  'CLOSED': 'Ditutup',
  'CANCELLED': 'Dibatalkan',

  // Invoice / Payment Statuses
  'ISSUED': 'Diterbitkan',
  'DRAFT': 'Konsep',
  'CONFIRMED': 'Dikonfirmasi',
  'UNPAID': 'Belum Bayar',
  'PARTIAL': 'Sebagian',
  'PAID': 'Lunas',
  'LUNAS': 'Lunas',
  'BELUM BAYAR': 'Belum Bayar',
  'SEBAGIAN DIBAYAR': 'Sebagian',
  'SEBAGIAN': 'Sebagian',
  'SENT': 'Diajukan',
  'DIAJUKAN': 'Diajukan',
  'APPROVED': 'Disetujui',
  'DISETUJUI': 'Disetujui',
  'REJECTED': 'Ditolak',
  'DITOLAK': 'Ditolak',
  'BATAL': 'Dibatalkan',
  'AKTIF': 'Aktif',
  'NONAKTIF': 'Nonaktif',
  'INACTIVE': 'Nonaktif',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const norm = (status || '').toUpperCase().trim();
  const displayLabel = FRIENDLY_LABELS[norm] || status;

  let colorClasses = 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-400/30';
  let dotColor = 'bg-slate-400';
  let dotGlow = 'shadow-[0_0_6px_rgba(148,163,184,0.6)]';
  let isPulsing = false;

  // 1. Kegiatan: ACTIVE (Sedang Berjalan) - Vibrant Emerald with pulsing dot
  if (norm === 'ACTIVE' || norm === 'AKTIF') {
    colorClasses = 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/35';
    dotColor = 'bg-emerald-500';
    dotGlow = 'shadow-[0_0_8px_rgba(16,185,129,0.8)]';
    isPulsing = true;
  }
  // 2. Kegiatan: PLANNED (Direncanakan) - Sky Blue with glowing dot
  else if (norm === 'PLANNED') {
    colorClasses = 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/35';
    dotColor = 'bg-sky-500';
    dotGlow = 'shadow-[0_0_8px_rgba(14,165,233,0.8)]';
  }
  // 3. Kegiatan: COMPLETED (Selesai) / Lunas / Approved - Teal / Emerald
  else if (norm === 'COMPLETED' || norm === 'LUNAS' || norm === 'DISETUJUI' || norm === 'APPROVED' || norm === 'PAID' || norm === 'CONFIRMED') {
    colorClasses = 'bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/35';
    dotColor = 'bg-teal-500';
    dotGlow = 'shadow-[0_0_8px_rgba(20,184,166,0.8)]';
  }
  // 4. Kegiatan: CLOSED (Ditutup) - Refined Indigo-Slate
  else if (norm === 'CLOSED') {
    colorClasses = 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30';
    dotColor = 'bg-indigo-400';
    dotGlow = 'shadow-[0_0_6px_rgba(99,102,241,0.6)]';
  }
  // 5. Partial / In Progress / Sent - Cobalt Blue
  else if (norm === 'SEBAGIAN DIBAYAR' || norm === 'SEBAGIAN' || norm === 'PARTIAL' || norm === 'SENT' || norm === 'DIAJUKAN' || norm === 'ISSUED') {
    colorClasses = 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/35';
    dotColor = 'bg-blue-500';
    dotGlow = 'shadow-[0_0_8px_rgba(59,130,246,0.8)]';
  }
  // 6. Unpaid / Warning - Amber
  else if (norm === 'BELUM BAYAR' || norm === 'UNPAID' || norm === 'PENDING' || norm === 'MENUNGGU') {
    colorClasses = 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/35';
    dotColor = 'bg-amber-500';
    dotGlow = 'shadow-[0_0_8px_rgba(245,158,11,0.8)]';
  }
  // 7. Cancelled / Rejected - Rose Red
  else if (norm === 'CANCELLED' || norm === 'BATAL' || norm === 'DITOLAK' || norm === 'REJECTED' || norm === 'VOID' || norm === 'FAILED') {
    colorClasses = 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/35';
    dotColor = 'bg-rose-500';
    dotGlow = 'shadow-[0_0_8px_rgba(244,63,94,0.8)]';
  }
  // 8. Draft - Soft Neutral
  else if (norm === 'DRAFT') {
    colorClasses = 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-400/30';
    dotColor = 'bg-slate-400';
    dotGlow = 'shadow-[0_0_6px_rgba(148,163,184,0.5)]';
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border backdrop-blur-xs transition-all",
        sizeClasses,
        colorClasses,
        className
      )}
      title={`Status sistem: ${status}`}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full shrink-0", 
        dotColor, 
        dotGlow,
        isPulsing && "animate-pulse"
      )} />
      <span>{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;
