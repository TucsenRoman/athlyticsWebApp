// components/cards/CardFormatter.tsx
import { cn } from "@/lib/utils";

export default function CardFormatter({
  title,
  icon: Icon,
  children,
  actions,
  onClick,
  className,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        `
        h-full w-full
        rounded-xl
        bg-white dark:bg-neutral-900
        p-4
        shadow-sm shadow-black/5
        flex flex-col gap-4
        transition
        hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40
        `,
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <span className="text-lg font-semibold">{title}</span>
        </div>

        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3">
        {children}
      </div>
    </div>
  );
}
