import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
    none: '',
  };

  const skeletonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${animationClasses[animation]}
    ${className}
  `.trim();

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : '1rem'),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={skeletonClasses}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return <div className={skeletonClasses} style={style} />;
};

// Pre-built skeleton components for common use cases
export const PostSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 animate-fade-in">
    <div className="flex items-start space-x-4 mb-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <Skeleton variant="text" width="40%" height="1.25rem" className="mb-2" />
        <Skeleton variant="text" width="60%" height="1rem" />
      </div>
    </div>
    <Skeleton variant="text" lines={3} className="mb-4" />
    <Skeleton variant="rounded" height={200} className="mb-4" />
    <div className="flex items-center space-x-6">
      <Skeleton variant="text" width={60} />
      <Skeleton variant="text" width={80} />
    </div>
  </div>
);

export const UserCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4 animate-fade-in">
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" height="1.25rem" className="mb-2" />
        <Skeleton variant="text" width="40%" height="1rem" className="mb-2" />
        <Skeleton variant="text" width="80%" height="0.875rem" />
      </div>
      <Skeleton variant="rounded" width={80} height={32} />
    </div>
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden animate-fade-in">
    <Skeleton variant="rectangular" height={128} />
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Skeleton variant="circular" width={80} height={80} className="-mt-10 border-4 border-white" />
          <div>
            <Skeleton variant="text" width={200} height="1.75rem" className="mb-2" />
            <Skeleton variant="text" width={120} height="1.25rem" className="mb-2" />
            <Skeleton variant="text" width={300} height="1rem" />
          </div>
        </div>
        <Skeleton variant="rounded" width={100} height={40} />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="text-center">
            <Skeleton variant="text" width="60%" height="1.5rem" className="mb-1 mx-auto" />
            <Skeleton variant="text" width="40%" height="1rem" className="mx-auto" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Skeleton;
