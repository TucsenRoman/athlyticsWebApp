import * as React from "react";
import { cn } from "@/utils/utils";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export interface TabToggleItem<T extends string = string> {
  value: T;
  label: string;
  icon: React.ReactNode;
}

interface TabTogglerProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  items: readonly TabToggleItem<T>[];
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function TabToggler<T extends string>({
  value,
  onChange,
  items,
}: TabTogglerProps<T>) {
  return (
    <div className="flex items-center h-8 min-w-0">
      {/* Pill container */}
      <div className="flex items-center gap-1 p-1 h-full bg-[var(--gray-100)] rounded-full">
        {items.map((item) => {
          const active = value === item.value;

          return (
            <div
              key={item.value}
              role="button"
              tabIndex={0}
              onClick={() => onChange(item.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onChange(item.value);
                }
              }}
              className={cn(
                "flex items-center gap-1 h-6 px-2 rounded-full transition cursor-pointer select-none",
                active
                  ? "bg-[var(--accent-bg)] text-[var(--accent)]"
                  : "text-[var(--text)]"
              )}
            >
              {/* ICON */}
              <span className="flex items-center justify-center">
                <span className="block md:hidden scale-125">
                  {item.icon}
                </span>
                <span className="hidden md:block scale-100">
                  {item.icon}
                </span>
              </span>

              {/* LABEL */}
              <span
                className={cn(
                  "text-sm font-medium",
                  active ? "inline md:inline" : "hidden md:inline"
                )}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
