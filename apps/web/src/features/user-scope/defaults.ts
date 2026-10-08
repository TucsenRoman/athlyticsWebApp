// src/features/user-settings/defaults.ts
import type { UserSettings } from "./types";

export const DEFAULT_USER_SETTINGS: UserSettings = {
  uiDensity: "comfortable",
  defaultWorkspaceMode: "manager",

  notifySystem: true,
  notifyProgram: true,
  notifyMessages: true,

  timezone: "UTC",
  locale: "en-US",
};
