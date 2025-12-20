import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/utils";

/* ========================================================================== */
/* BUTTON VARIANTS                                                            */
/* ========================================================================== */

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap rounded-md text-sm font-medium",
    "ring-offset-background transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--warning))] focus-visible:ring-offset-2",
    "disabled:pointer-not-allowed disabled:opacity-50", //fix not allowed pointer
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "px-2 py-1"
  ].join(" "),
  {
    variants: {
      /* -------------------------------- VARIANT ---------------------------- */
      variant: {
        none: "m-0 p-0 bg-none",

        default:
          "bg-[var(--edit)] text-[var(--accent-foreground)] hover:brightness-110",

        toolbar: [
          "h-[32px] w-[32px] p-0 rounded-full",
          "bg-[var(--gray-100)] hover:bg-[var(--accent-bg)]",
          "text-[var(--text)]",
          "data-[active=true]:text-[var(--accent)]",
          "data-[active=true]:hover:bg-[var(--accent-bg)]",
        ].join(" "),

        destructive:
          "bg-[var(--danger)] text-[var(--white)] hover:brightness-110",

        outline:
          "border border-[var(--border)] text-[var(--text)] bg-transparent hover:bg-[var(--gray-50)]",

        secondary:
          "bg-[var(--gray-100)] text-[var(--gray-700)] hover:brightness-105",

        ghost:
          "bg-transparent text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--text-accent)]",

        link:
          "text-[var(--accent)] underline-offset-4 hover:underline",

        success:
          "bg-[var(--success)] text-[var(--text-dark)] hover:brightness-105",

        info:
          "bg-[var(--info)] text-[var(--white)] hover:brightness-105",

        warning:
          "bg-[var(--warning)] text-[var(--black)] hover:brightness-105",

        accent:
          "bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-110",
      },

      /* -------------------------------- SIZE ------------------------------- */
      size: {
        default: "h-auto w-auto",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },

      /* --------------------------- ICON SIZE (SVG) -------------------------- */
      iconSize: {
        sm: "[&_svg]:h-[16px] [&_svg]:w-[16px]",
        md: "[&_svg]:h-[20px] [&_svg]:w-[20px]",
        lg: "[&_svg]:h-[24px] [&_svg]:w-[24px]",
        xlg: "[&_svg]:h-[32px] [&_svg]:w-[32px]",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      iconSize: "md",
    },
  },
);

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, iconSize, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, iconSize }),
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
