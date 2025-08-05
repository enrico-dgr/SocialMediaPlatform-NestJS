import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
  count?: number;
  showZero?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  count,
  showZero = false,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-primary-100 text-primary-800 border-primary-200',
    secondary: 'bg-secondary-100 text-secondary-800 border-secondary-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const dotVariantClasses = {
    default: 'bg-gray-400',
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-full border
    transition-all duration-200
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim();

  const shouldShowCount = count !== undefined && (count > 0 || showZero);
  const displayCount = count && count > 99 ? '99+' : count;

  if (dot) {
    return (
      <span className="relative inline-flex">
        {children}
        <span
          className={`
            absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full
            ${dotVariantClasses[variant]}
            animate-pulse-soft
          `}
        />
      </span>
    );
  }

  if (shouldShowCount) {
    const countSizeClasses = {
      sm: 'min-w-[1.25rem] h-5 text-xs px-1',
      md: 'min-w-[1.5rem] h-6 text-sm px-1.5',
      lg: 'min-w-[1.75rem] h-7 text-base px-2',
    };

    const countVariantClasses = {
      default: 'bg-gray-500 text-white',
      primary: 'bg-primary-500 text-white',
      secondary: 'bg-secondary-500 text-white',
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-white',
      error: 'bg-red-500 text-white',
      info: 'bg-blue-500 text-white',
    };

    return (
      <span className="relative inline-flex">
        {children}
        <span
          className={`
            absolute -top-2 -right-2
            inline-flex items-center justify-center
            rounded-full font-bold
            ${countSizeClasses[size]}
            ${countVariantClasses[variant]}
            animate-bounce-soft
          `}
        >
          {displayCount}
        </span>
      </span>
    );
  }

  return <span className={baseClasses}>{children}</span>;
};

export default Badge;
