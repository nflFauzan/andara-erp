import React from 'react';
import { cn } from '@/lib/utils';

export interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  glow?: boolean;
  variant?: 'glass' | 'convex' | 'concave' | 'inset' | 'flat';
  depth?: 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'default' | 'lg';
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className = '',
  hoverable = false,
  glow = false,
  variant = 'glass',
  depth = 'md',
  padding = 'default',
  ...props
}) => {
  const paddingClasses =
    padding === 'none'
      ? 'p-0'
      : padding === 'sm'
      ? 'p-3.5'
      : padding === 'lg'
      ? 'p-8'
      : 'p-6';

  let surfaceClasses = "bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]";

  if (variant === 'inset' || variant === 'concave') {
    surfaceClasses = depth === 'sm' 
      ? 'bg-slate-100/60 dark:bg-slate-950/60 backdrop-blur-xs border border-slate-200/50 dark:border-slate-800/50 shadow-inner' 
      : 'bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-800/60 shadow-inner';
  } else if (variant === 'flat') {
    surfaceClasses = 'bg-white/50 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800/40 shadow-xs';
  }

  return (
    <div
      className={cn(
        "relative rounded-2xl transition-all duration-200",
        surfaceClasses,
        paddingClasses,
        hoverable && "hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(37,99,235,0.1)] dark:hover:shadow-[0_14px_35px_rgba(0,0,0,0.5)] hover:border-blue-400/30 cursor-pointer",
        glow && "ring-2 ring-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.25)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const NeuCard = BentoCard;
export const GlassPanel = BentoCard;
export default BentoCard;
