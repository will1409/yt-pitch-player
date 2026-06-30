import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'active' | 'error';
  className?: string;
}

const variantClasses = {
  default: 'bg-white/10 text-white/60',
  active: 'bg-violet-600/30 text-violet-300 border border-violet-500/40',
  error: 'bg-red-600/20 text-red-300 border border-red-500/30',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
};
