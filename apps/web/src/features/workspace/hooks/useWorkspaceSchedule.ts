// src/features/workspace/hooks/useWorkspaceSchedule.ts
"use client";

import { useState } from "react";

export function useWorkspaceSchedule() {
  const [scheduleWeekIndex, setScheduleWeekIndex] = useState(1);
  const [showAddSlot, setShowAddSlot] = useState(false);

  return {
    scheduleWeekIndex,
    setScheduleWeekIndex,

    showAddSlot,
    setShowAddSlot,
  };
}
