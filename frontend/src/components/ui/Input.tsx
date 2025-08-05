import React, { forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  isPassword?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'outlined',
      size = 'md',
      isPassword = false,
      className = '',
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    };

    const variantClasses = {
      default: `
        border-0 bg-gradient-to-br from-gray-50 to-gray-100 
        focus:from-white focus:to-gray-50 focus:ring-4 focus:ring-primary-200/50 focus:shadow-colored-lg
        hover:from-gray-100 hover:to-gray-200 hover:shadow-soft
      `,
      outlined: `
        border-2 border-gray-200/60 bg-white/90 backdrop-blur-sm shadow-soft
        focus:border-primary-400 focus:ring-4 focus:ring-primary-200/50 focus:shadow-colored-lg focus:bg-white
        hover:border-gray-300 hover:shadow-medium hover:bg-white
      `,
      filled: `
        border-0 bg-gradient-to-br from-primary-50/50 to-secondary-50/30 shadow-inner-soft
        focus:from-primary-100/70 focus:to-secondary-100/50 focus:ring-4 focus:ring-primary-200/50 focus:shadow-colored
        hover:from-primary-100/60 hover:to-secondary-100/40 hover:shadow-soft
      `,
    };

    const baseClasses = `
      w-full rounded-xl transition-all duration-300 ease-soft
      placeholder:text-gray-400 placeholder:font-normal
      focus:outline-none focus:scale-[1.02] focus:shadow-colored-lg
      disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60
      ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-200 shadow-red-200/50' : ''}
    `;

    const inputClasses = `
      ${baseClasses}
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      ${leftIcon ? 'pl-12' : ''}
      ${rightIcon || isPassword ? 'pr-12' : ''}
      ${className}
    `.trim();

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-800 mb-3 transition-colors duration-200">
            {label}
            {props.required && <span className="text-red-500 ml-1 animate-pulse-soft">*</span>}
          </label>
        )}
        
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300 group-focus-within:text-primary-500 group-focus-within:scale-110 z-10">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={inputClasses}
            {...props}
          />
          
          {(rightIcon || isPassword) && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-primary-500 hover:scale-110 transition-all duration-300 p-1 rounded-lg hover:bg-primary-50"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="mt-1">
            {error && (
              <p className="text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠</span>
                {error}
              </p>
            )}
            {!error && helperText && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
