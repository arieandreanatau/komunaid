'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

function LoadingState({
  className,
  size = 'md',
  text,
  fullScreen = false,
  ...props
}: LoadingStateProps) {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)} {...props}>
      <Loader2 className={cn('animate-spin text-royal-500', sizeMap[size])} />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="flex min-h-[400px] items-center justify-center">{content}</div>;
  }

  return content;
}

export { LoadingState };
export type { LoadingStateProps };
