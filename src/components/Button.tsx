import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2', // ensures 44px touch target on mobile!
    lg: 'text-base px-6 py-3 min-h-[50px] gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-teal-700 text-white hover:bg-teal-800 focus:ring-teal-600 shadow-sm border border-teal-800/20',
    secondary:
      'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 focus:ring-emerald-500 border border-emerald-200',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    outline:
      'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-400 focus:ring-teal-600',
    ghost:
      'text-stone-600 hover:bg-stone-100 hover:text-stone-900 focus:ring-stone-400',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
