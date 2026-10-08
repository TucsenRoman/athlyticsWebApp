import {
  Star,
  Flag,
  Trophy,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* FLAVORS                                                                    */
/* -------------------------------------------------------------------------- */

export type ScheduleFlavor =
  | "blue"
  | "green"
  | "purple"
  | "slate"
  | "red"
  | "yellow"
  | "coral"
  | "teal"
  | "indigo";

/* -------------------------------------------------------------------------- */
/* COLOR MAPS                                                                 */
/* -------------------------------------------------------------------------- */

export const SLOT_COLOR_MAP: Record<ScheduleFlavor, string> = {
  blue: "bg-[var(--fvr-blue-md)] text-white",
  green: "bg-[var(--fvr-green-md)] text-white",
  purple: "bg-[var(--fvr-purple-md)] text-white",
  slate: "bg-[var(--fvr-slate-md)] text-white",
  red: "bg-[var(--fvr-red-md)] text-white",
  yellow: "bg-[var(--fvr-yellow-md)] text-black",
  coral: "bg-[var(--fvr-coral-md)] text-white",
  teal: "bg-[var(--fvr-teal-md)] text-white",
  indigo: "bg-[var(--fvr-indigo-md)] text-white",
};

export const SUBSLOT_COLOR_MAP: Record<ScheduleFlavor, string> = {
  blue: "bg-[var(--fvr-blue-bg)]",
  green: "bg-[var(--fvr-green-bg)]",
  purple: "bg-[var(--fvr-purple-bg)]",
  slate: "bg-[var(--fvr-slate-bg)]",
  red: "bg-[var(--fvr-red-bg)]",
  yellow: "bg-[var(--fvr-yellow-bg)]",
  coral: "bg-[var(--fvr-coral-bg)]",
  teal: "bg-[var(--fvr-teal-bg)]",
  indigo: "bg-[var(--fvr-indigo-bg)]",
};

/* -------------------------------------------------------------------------- */
/* ICON MAP                                                                   */
/* -------------------------------------------------------------------------- */

export const SLOT_ICON_MAP: Record<string, LucideIcon> = {
  star: Star,
  flag: Flag,
  trophy: Trophy,
  dumbbell: Dumbbell,
};

/* -------------------------------------------------------------------------- */
/* NORMALIZERS                                                                */
/* -------------------------------------------------------------------------- */

export function normalizeFlavor(raw?: string | null): ScheduleFlavor {
  if (!raw) return "slate";
  const cleaned = raw.replace("slot-", "");
  if (cleaned in SLOT_COLOR_MAP) return cleaned as ScheduleFlavor;
  return "slate";
}

export function resolveIcon(id?: string | null): LucideIcon {
  return SLOT_ICON_MAP[id ?? "star"] ?? Star;
}

/* -------------------------------------------------------------------------- */
/* TIME HELPERS                                                               */
/* -------------------------------------------------------------------------- */

export function minutesToLabel(min: number | null): string {
  if (min == null) return "All Day";

  let h = Math.floor(min / 60);
  const m = min % 60;
  const period = h >= 12 ? "PM" : "AM";

  if (h === 0) h = 12;
  if (h > 12) h -= 12;

  return `${h}:${m.toString().padStart(2, "0")} ${period}`;
}

/* -------------------------------------------------------------------------- */
/* DATE HELPERS                                                               */
/* -------------------------------------------------------------------------- */

// JS: 0=Sun → Schedule: 0=Mon
export function getTodayScheduleIndex(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}
