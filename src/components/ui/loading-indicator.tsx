"use client";

interface LoadingIndicatorProps {
  message?: string;
}

export function LoadingIndicator({ message }: LoadingIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="h-6 w-6 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin mb-2"></div>
      {message && <p className="text-sm text-[hsl(var(--text))]">{message}</p>}
    </div>
  );
}
