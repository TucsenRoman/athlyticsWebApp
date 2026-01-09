import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/utils";

/* ========================================================================== */
/* BUTTON VARIANTS                                                            */
/* ========================================================================== */
// ~Add mobile auto apply variants
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap rounded-md text-sm font-medium",
    "ring-offset-background transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--warning))] focus-visible:ring-offset-2",
    "disabled:pointer-not-allowed disabled:opacity-50", //fix not allowed pointer
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "px-2 py-1",
    "transition-all duration-300",
  ].join(" "),
  {
    variants: {
      /* -------------------------------- VARIANT ---------------------------- */
      variant: {
        default:
          "none",

        solid:
          "bg-[var(--dom-dk)] hover:bg-[var(--dom-lt)] text-white hover:text-[var(--dom-dk)]",

        stick: [
          "h-[32px] w-[32px] p-0",
          "rounded-full bg-[var(--gray-5)] hover:bg-[var(--gray-7)]",
          "data-[active=true]:bg-[var(--gray-7)] data-[active=true]:hover:bg-[var(--gray-8)]",
          "text-[var(--text)] data-[active=true]:text-[var(--text)]",
        ].join(" "),

        float: [
          "h-[32px] w-[32px] p-0 rounded-full",
          "bg-[var(--gray-5)] hover:bg-[var(--gray-6)]",
          "text-[var(--text)]",
          "data-[active=true]:text-[var(--acc-dk)]",
          "data-[active=true]:hover:bg-[var(--acc-bg)]",
          "shadow-md hover:shadow-lg",
        ].join(" "),

        danger:
          "bg-[var(--danger-bg)] hover:bg-[var(--danger)] text-[var(--danger)] hover:text-white",

        outline:
          "border border-[var(--border)] hover:border-transparent bg-transparent hover:bg-[var(--gray-lt)] text-[var(--text-dk)] hover:text-[var(--acc-dk)]",

        secondary:
          "bg-[var(--gray-lt)] text-[var(--gray-dk)] hover:brightness-105",

        ghost:
          "w-10 bg-transparent hover:bg-white/40 text-[var(--text-dk)]",

        link:
          "text-[var(--dom-dk)] underline-offset-4 hover:underline",

        success:
          "bg-[var(--success)] text-[var(--text-dk)] hover:brightness-105",

        info:
          "bg-[var(--info)] text-[var(--white)] hover:brightness-105",

        warning:
          "bg-[var(--warning)] text-[var(--black)] hover:brightness-105",
      },

      /* -------------------------------- SIZE ------------------------------- */
      regular: {
        default: "none",
        xs: "h-6 w-6",
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
        mobile: "",
      },

      irregular: {
        default: "none",
        xs: "h-6 w-auto px-4",
        sm: "h-8 w-auto px-4",
        md: "h-10 w-auto px-4",
        lg: "h-12 w-auto px-4",
        mobile: "",
      },

      /* --------------------------- ICON SIZE (SVG) -------------------------- */
      iconSize: {
        none: "none",
        sm: "[&_svg]:h-[16px] [&_svg]:w-[16px]",
        md: "[&_svg]:h-[20px] [&_svg]:w-[20px]",
        lg: "[&_svg]:h-[24px] [&_svg]:w-[24px]",
        xl: "[&_svg]:h-[32px] [&_svg]:w-[32px]",
      },
    },

    defaultVariants: {
      variant: "default",
      regular: "default",
      irregular: "default",
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
    { className, variant, regular, irregular, iconSize, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({ variant, regular, irregular, iconSize }),
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
