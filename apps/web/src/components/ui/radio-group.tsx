'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

interface RadioGroupItemProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  value: string;
}

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}>({});

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, name, children, ...props }, ref) => (
    <RadioGroupContext.Provider value={{ value, onValueChange, name }}>
      <div ref={ref} role="radiogroup" className={cn('grid gap-2', className)} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  ),
);
RadioGroup.displayName = 'RadioGroup';

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value: itemValue, disabled, ...props }, ref) => {
    const { value, onValueChange, name } = React.useContext(RadioGroupContext);
    const isChecked = value === itemValue;

    return (
      <label
        className={cn(
          'inline-flex items-center gap-2 text-sm font-medium leading-none',
          disabled && 'cursor-not-allowed opacity-70',
          !disabled && 'cursor-pointer',
        )}
      >
        <span className="relative flex h-4 w-4 items-center justify-center">
          <input
            ref={ref}
            type="radio"
            name={name}
            value={itemValue}
            checked={isChecked}
            disabled={disabled}
            onChange={() => onValueChange?.(itemValue)}
            className="sr-only"
            {...props}
          />
          <span
            className={cn(
              'h-4 w-4 rounded-full border border-gray-300',
              isChecked && 'border-royal-500 bg-royal-500',
            )}
          >
            {isChecked && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            )}
          </span>
        </span>
        {props.children}
      </label>
    );
  },
);
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
