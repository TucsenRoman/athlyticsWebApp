import React from "react";

type TagVariant = "muted" | "primary" | "secondary" | "accent";

const VARIANTS: Record<TagVariant, string> = {
  muted: `
    bg-[hsl(var(--surface-muted))]
    text-[hsl(var(--text-muted))]
  `,
  primary: `
    bg-[hsl(var(--action-primary))]/15
    text-[hsl(var(--action-primary))]
  `,
  secondary: `
    bg-[hsl(var(--tag-secondary))]/20
    text-[hsl(var(--tag-secondary))]
    uppercase font-semibold tracking-wide
  `,
  accent: `
    bg-[hsl(var(--tag-dom-md))]/15
    text-[hsl(var(--tag-dom-md))]
  `,
};

export function Tag({
  children,
  variant = "muted",
  className = "",
}: {
  children: React.ReactNode;
  variant?: TagVariant;
  className?: string;
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
        ${VARIANTS[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
