"use client";

import { cn } from "@/utils/utils";
import { CardInfo } from "@/components/layout/CardInfo";

export default function CardFormatter({
  title,
  icon: Icon,
  children,
  actions,
  infoContent,      // ⬅ renamed + clearer meaning
  onClick,
  className,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  actions?: React.ReactNode;
  infoContent?: React.ReactNode; // accepts JSX, not objects
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        `
        h-full w-full
        rounded-lg
        border border-[var(--border)]
        bg-[var(--bg)]
        p-4 pt-2
        shadow-lg
        flex flex-col gap-3
        transition
      `,
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Header */}
      <div
        className="
          relative
          flex items-center justify-center
          border-b border-[var(--border)]
          pb-2
        "
      >
        {/* Centered Icon + Title */}
        <div className="flex items-center gap-2 pointer-events-none">
          <Icon className="w-5 h-5 text-[var(--text-dk)]" />
          <span className="text-lg font-semibold text-[var(--text-dk)]">
            {title}
          </span>
        </div>

        {/* Header Info Button (top-right) */}
        {infoContent && (
          <div className="absolute top-0 right-0 text-[var(--text)]">
            <CardInfo content={infoContent} />
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Subheader (ACTIONS ONLY)                                       */}
      {/* -------------------------------------------------------------- */}
      {actions && (
        <div className="flex justify-between items-center gap-2">
          {actions}
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* Content                                                        */}
      {/* -------------------------------------------------------------- */}
      <div className="relative flex flex-col gap-3 overflow-auto pb-5">
        {children}
      </div>
    </div>
  );
}
