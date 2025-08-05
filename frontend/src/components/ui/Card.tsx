import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'bg-white/95 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-soft',
    outlined: 'bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300',
    elevated: 'bg-white rounded-2xl shadow-medium border border-gray-100/50 backdrop-blur-sm',
    glass: 'bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl shadow-strong',
  };

  const hoverClasses = hover
    ? 'transition-all duration-300 ease-soft hover:shadow-strong hover:-translate-y-2 hover:scale-[1.02] cursor-pointer group'
    : 'transition-all duration-300 ease-soft';

  const cardClasses = `
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${hoverClasses}
    ${className}
  `.trim();

  return <div className={cardClasses}>{children}</div>;
};

export default Card;
