import React from 'react';
import { cn } from '@/lib/utils';

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'default' | 'lg';
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className = '',
  hoverable = false,
  glow = false,
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

  return (
    <div
      className={cn(
        "bento-card relative overflow-hidden",
        paddingClasses,
        hoverable && "bento-card-hover cursor-pointer",
        glow && "ring-1 ring-brand-500/30 dark:ring-blue-500/40 shadow-glow-blue",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
export default BentoCard;
