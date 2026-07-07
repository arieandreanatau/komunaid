'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const toastVariants = cva(
  'pointer-events-auto relative flex w-full items-center gap-3 rounded-lg border p-4 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-200 text-gray-950',
        success: 'bg-teal-50 border-teal-200 text-teal-900',
        destructive: 'bg-red-50 border-red-200 text-red-900',
        warning: 'bg-amber-50 border-amber-200 text-amber-900',
        info: 'bg-royal-50 border-royal-200 text-royal-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const iconMap = {
  success: CheckCircle,
  destructive: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  default: Info,
};

interface ToastProps extends VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

function Toast({ variant = 'default', title, description, onClose, className }: ToastProps) {
  const Icon = iconMap[variant ?? 'default'];

  return (
    <div className={cn(toastVariants({ variant }), className)}>
      <Icon className="h-5 w-5 shrink-0" />
      <div className="flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<ToastProps & { id: string }>;
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

export { Toast, ToastContainer, toastVariants };
export type { ToastProps, ToastContainerProps };
