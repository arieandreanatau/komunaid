import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Label } from "./label";

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && <Label htmlFor={id}>{label}</Label>}
        <select
          id={id}
          className={cn(
            "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-komuna-blue focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
