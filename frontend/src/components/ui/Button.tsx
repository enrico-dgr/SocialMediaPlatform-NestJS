import React, { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm font-medium',
      md: 'px-6 py-3 text-base font-medium',
      lg: 'px-8 py-4 text-lg font-medium',
    };

    const variantClasses = {
      primary: `
        bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0 shadow-colored
        hover:from-primary-600 hover:to-primary-700 hover:shadow-colored-lg hover:scale-105
        focus:ring-2 focus:ring-primary-200 focus:ring-offset-2 focus:shadow-glow
        active:from-primary-700 active:to-primary-800 active:scale-95
        disabled:from-primary-300 disabled:to-primary-400 disabled:shadow-none disabled:scale-100
      `,
      secondary: `
        bg-gradient-to-r from-secondary-500 to-secondary-600 text-white border-0 shadow-colored
        hover:from-secondary-600 hover:to-secondary-700 hover:shadow-colored-lg hover:scale-105
        focus:ring-2 focus:ring-secondary-200 focus:ring-offset-2 focus:shadow-glow
        active:from-secondary-700 active:to-secondary-800 active:scale-95
        disabled:from-secondary-300 disabled:to-secondary-400 disabled:shadow-none disabled:scale-100
      `,
      outline: `
        bg-white/80 backdrop-blur-sm text-primary-600 border-2 border-primary-300 shadow-soft
        hover:bg-primary-50 hover:border-primary-400 hover:text-primary-700 hover:shadow-colored
        focus:ring-2 focus:ring-primary-200 focus:ring-offset-2 focus:border-primary-500
        active:bg-primary-100 active:scale-95
        disabled:text-primary-300 disabled:border-primary-200 disabled:bg-gray-50
      `,
      ghost: `
        bg-transparent text-gray-700 border border-transparent
        hover:bg-gray-100/80 hover:text-gray-900 hover:backdrop-blur-sm hover:shadow-soft
        focus:ring-2 focus:ring-gray-200 focus:ring-offset-2
        active:bg-gray-200 active:scale-95
        disabled:text-gray-400
      `,
      danger: `
        bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-colored
        hover:from-red-600 hover:to-red-700 hover:shadow-colored-lg hover:scale-105
        focus:ring-2 focus:ring-red-200 focus:ring-offset-2 focus:shadow-glow
        active:from-red-700 active:to-red-800 active:scale-95
        disabled:from-red-300 disabled:to-red-400 disabled:shadow-none disabled:scale-100
      `,
    };

    const baseClasses = `
      inline-flex items-center justify-center font-semibold
      rounded-2xl transition-all duration-300 ease-soft transform-gpu
      focus:outline-none focus:shadow-glow focus:scale-105
      disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none
      backdrop-blur-sm
      ${fullWidth ? 'w-full' : ''}
    `;

    const buttonClasses = `
      ${baseClasses}
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      ${className}
    `.trim();

    const LoadingSpinner = () => (
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <LoadingSpinner />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
