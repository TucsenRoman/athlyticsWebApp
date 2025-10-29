import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes select values to prevent empty string errors in Radix Select
 * Converts empty string or null to undefined so placeholder shows
 */
export function sanitizeSelectValue(v?: string | null): string | undefined {
  return v === "" || v == null ? undefined : v;
}
