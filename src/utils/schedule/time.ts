// src/utils/time.ts

/**
 * Convert "6:05 PM" → minutes since midnight (1105)
 * Convert "12:00 AM" → 0
 * Convert "12:00 PM" → 720
 */
export function uiTimeToMinutes(input: string | null | undefined): number {
  if (!input) return Number.MAX_SAFE_INTEGER;

  const [timePart, period] = input.split(" "); // "6:05", "PM"
  if (!timePart || !period) return Number.MAX_SAFE_INTEGER;

  const [hStr, mStr] = timePart.split(":");
  let hour = Number(hStr);
  const minute = Number(mStr);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return Number.MAX_SAFE_INTEGER;
  }

  // Convert → 24-hour
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return hour * 60 + minute;
}
