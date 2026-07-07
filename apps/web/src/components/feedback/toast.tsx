'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const toastVariants = cva(
  'pointer-events-auto relative flex w-full max-w-sm items-start gap-3 rounded-lg border bg-white p-4 shadow-lg',
  {
    variants: {
      variant: {
        info: 'border-blue-200',
        success: 'border-teal-200',
        warning: 'border-yellow-200',
        error: 'border-red-200',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
);

const iconVariants = {
  info: <Info className="h-5 w-5 text-blue-500" />,
  success: <CheckCircle2 className="h-5 w-5 text-teal-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
};

interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  onClose?: () => void;
  showIcon?: boolean;
}

function Toast({
  className,
  variant = 'info',
  title,
  description,
  onClose,
  showIcon = true,
  ...props
}: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      {showIcon && iconVariants[variant || 'info']}
      <div className="flex-1">
        {title && <p className="text-sm font-semibold text-gray-900">{title}</p>}
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export { Toast, toastVariants };
export type { ToastProps };
