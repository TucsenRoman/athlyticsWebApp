import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/utils/utils";

/* ========================================================================== */
/* ROOT                                                                       */
/* ========================================================================== */

const Tabs = TabsPrimitive.Root;

/* ========================================================================== */
/* LIST                                                                       */
/* ========================================================================== */

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // layout
      "flex w-full items-center gap-1 p-1",

      // shape
      "rounded-lg",

      // surface
      "bg-[var(--gray-3)] border border-[var(--border)]",

      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

/* ========================================================================== */
/* TRIGGER                                                                    */
/* ========================================================================== */

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // base
      "relative inline-flex items-center justify-center gap-2",
      "px-3 py-1.5 text-sm font-medium",
      "rounded-md border border-transparent transition-colors",

      // text
      "text-[var(--text)]",

      // hover
      "hover:bg-[var(--gray-4)]",

      // focus
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dom-md)] focus-visible:ring-offset-2",

      // disabled
      "disabled:pointer-events-none disabled:opacity-50",

      // inactive
      "data-[state=inactive]:text-[var(--text-lt)]",

      // active
      "data-[state=active]:bg-[var(--gray-4)]",
      "data-[state=active]:text-[var(--text-dk)]",
      "data-[state=active]:shadow-sm",
      // "data-[state=active]:border data-[state=active]:border-[var(--border)]",

      // optional icon/span behavior (preserved)
      "[&_span]:data-[state=inactive]:hidden",
      "[&_span]:data-[state=inactive]:w-0",

      className,
    )}
    {...props}
  >
    {children}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

/* ========================================================================== */
/* CONTENT                                                                    */
/* ========================================================================== */

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      // spacing
      // "mt-0",

      // focus
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dom-md)] focus-visible:ring-offset-2",

      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

/* ========================================================================== */
/* EXPORT                                                                     */
/* ========================================================================== */

export { Tabs, TabsList, TabsTrigger, TabsContent };
