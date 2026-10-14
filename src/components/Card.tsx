import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'urgent';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  interactive = false,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border-stone-200 text-stone-900 shadow-sm',
    subtle: 'bg-stone-50/70 border-stone-200/80 text-stone-800',
    urgent: 'bg-red-50/40 border-red-200 text-stone-900 shadow-sm',
  };

  const interactiveStyles = interactive
    ? 'hover:border-teal-500/50 hover:shadow-md transition-all duration-200 cursor-pointer'
    : '';

  return (
    <div
      className={`rounded-2xl border p-5 ${variantStyles[variant]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
