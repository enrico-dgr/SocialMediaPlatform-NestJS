import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  ring?: boolean;
  className?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  initials,
  size = 'md',
  status,
  ring = false,
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const statusClasses = {
    online: 'bg-green-400 border-white',
    offline: 'bg-gray-300 border-white',
    away: 'bg-yellow-400 border-white',
    busy: 'bg-red-400 border-white',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  const ringClasses = ring
    ? 'ring-2 ring-primary-200 ring-offset-2 ring-offset-white'
    : '';

  const avatarClasses = `
    ${sizeClasses[size]} 
    relative inline-flex items-center justify-center
    rounded-full overflow-hidden transition-all duration-200
    ${ring ? ringClasses : ''}
    ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}
    ${className}
  `.trim();

  const getInitialsColor = (initials: string) => {
    const colors = [
      'bg-gradient-to-br from-pink-400 to-pink-600',
      'bg-gradient-to-br from-purple-400 to-purple-600',
      'bg-gradient-to-br from-indigo-400 to-indigo-600',
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-green-400 to-green-600',
      'bg-gradient-to-br from-yellow-400 to-yellow-600',
      'bg-gradient-to-br from-red-400 to-red-600',
      'bg-gradient-to-br from-teal-400 to-teal-600',
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="relative inline-block">
      <div className={avatarClasses} onClick={onClick}>
        {src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div
            className={`
              w-full h-full flex items-center justify-center
              text-white font-semibold
              ${getInitialsColor(initials || 'U')}
            `}
          >
            {initials || '?'}
          </div>
        )}
      </div>

      {/* Status indicator */}
      {status && (
        <div
          className={`
            absolute -bottom-0.5 -right-0.5 
            ${statusSizes[size]} 
            ${statusClasses[status]}
            rounded-full border-2
            transition-all duration-200
          `}
        />
      )}
    </div>
  );
};

export default Avatar;
