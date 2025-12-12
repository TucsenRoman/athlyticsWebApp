import {
  fetchScheduleWeek,
  fetchScheduleSlots,
  fetchSubslotsForSlots,
  type DbScheduleWeek,
  type DbScheduleSlot,
  type DbScheduleSubslot,
} from "@/lib/schedule/scheduleAPI";

import {
  compileScheduleWeek,
  type UiCompiledWeek,
} from "@/utils/schedule/scheduleCompiler";

export async function loadScheduleWeekReadOnly({
  programId,
  scheduleWeekIndex,
}: {
  programId: number;
  scheduleWeekIndex: number;
}): Promise<{
  week: DbScheduleWeek | null;
  slots: DbScheduleSlot[];
  subslots: DbScheduleSubslot[];
  compiled: UiCompiledWeek | null;
}> {
  console.log("[loadScheduleWeekReadOnly] START", {
    programId,
    scheduleWeekIndex,
  });

  const week = await fetchScheduleWeek(programId, scheduleWeekIndex);

  console.log("[loadScheduleWeekReadOnly] week:", week);

  if (!week) {
    return {
      week: null,
      slots: [],
      subslots: [],
      compiled: null,
    };
  }

  const slots = await fetchScheduleSlots(week.id);
  const slotIds = slots.map((s) => s.id);

  const subslots =
    slotIds.length > 0 ? await fetchSubslotsForSlots(slotIds) : [];

  const compiled = compileScheduleWeek(week, slots, subslots);

  return {
    week,
    slots,
    subslots,
    compiled,
  };
}
