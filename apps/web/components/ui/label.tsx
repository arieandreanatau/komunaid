import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "block text-sm font-medium text-gray-700",
          className
        )}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

export { Label };
