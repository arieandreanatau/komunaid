'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

const alertVariants = cva('relative w-full rounded-lg border-l-4 p-4 text-sm', {
  variants: {
    variant: {
      info: 'border-blue-300 bg-blue-50 text-blue-800',
      success: 'border-teal-300 bg-teal-50 text-teal-800',
      warning: 'border-yellow-300 bg-yellow-50 text-yellow-800',
      error: 'border-red-300 bg-red-50 text-red-800',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  showIcon?: boolean;
}

function Alert({ className, variant, showIcon = true, children, ...props }: AlertProps) {
  const Icon = variant ? iconMap[variant] : iconMap.info;

  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {showIcon && <Icon className="absolute left-4 top-4 h-4 w-4" />}
      <div className={cn(showIcon && 'ml-6')}>{children}</div>
    </div>
  );
}

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  ),
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
