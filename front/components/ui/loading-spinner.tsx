import React from 'react';

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
}

export function Spinner({ size = "medium" }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "h-4 w-4 border-2",
    medium: "h-8 w-8 border-3",
    large: "h-12 w-12 border-4"
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-t-transparent border-primary`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
}