"use client";

export function LoadingSpinner({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      role="status"
      aria-label="Memuat"
      className={`animate-spin rounded-full border-komuna-blue border-t-transparent ${sizeClasses[size]} ${className}`}
    >
      <span className="sr-only">Memuat...</span>
    </div>
  );
}
