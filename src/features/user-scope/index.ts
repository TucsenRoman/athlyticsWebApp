// src/features/user-settings/index.ts

export type { UserSettings, UIDensity, WorkspaceMode } from "./types";

export { DEFAULT_USER_SETTINGS } from "./defaults";

export {
  UserSettingsProvider,
  useUserSettingsContext,
} from "./UserSettingsContext";

export { useUserSettings } from "./useUserSettings";
