import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        none: "m-0 p-0 bg-none",
        default: "bg-[var(--edit)] text-[var(--accent-foreground)] hover:brightness-110",
        destructive: "bg-[var(--danger)] text-[var(--white)] hover:brightness-110",
        outline: "border border-[var(--border)] text-[var(--text)] bg-[(var(--accent)] hover:bg-[var(--gray-50)]",
        secondary: "bg-[hsl(var(--gray-100))] text-[hsl(var(--gray-700))] hover:brightness-105",
        ghost: "bg-transparent text-[hsl(var(--text))] hover:bg-[hsl(var(--accent)/0.15)] hover:text-[hsl(var(--text-accent))]",
        link: "text-[hsl(var(--accent))] underline-offset-4 hover:underline",
        success: "bg-[hsl(var(--success))] text-[hsl(var(--text-dark))] hover:brightness-105",
        info: "bg-[hsl(var(--info))] text-[hsl(var(--white))] hover:brightness-105",
        warning: "bg-[hsl(var(--warning))] text-[hsl(var(--black))] hover:brightness-105",
        accent: "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:brightness-110", // <-- ADD THIS
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
