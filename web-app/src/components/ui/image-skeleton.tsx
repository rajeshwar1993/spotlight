import { cn } from '@/lib/utils';

interface ImageSkeletonProps {
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  showIcon?: boolean;
}

export function ImageSkeleton({ 
  className, 
  aspectRatio = 'auto',
  showIcon = true 
}: ImageSkeletonProps) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: ''
  };

  return (
    <div 
      className={cn(
        'animate-pulse bg-gray-200 rounded-lg flex items-center justify-center',
        aspectClasses[aspectRatio],
        className
      )}
    >
      {showIcon && (
        <svg
          className="w-8 h-8 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );
}