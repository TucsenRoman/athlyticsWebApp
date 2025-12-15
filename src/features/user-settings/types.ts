// src/features/user-settings/types.ts
export type UIDensity = "compact" | "comfortable" | "spacious";
export type WorkspaceMode = "manager" | "editor";

export interface UserSettings {
  uiDensity: UIDensity;
  defaultWorkspaceMode: WorkspaceMode;

  notifySystem: boolean;
  notifyProgram: boolean;
  notifyMessages: boolean;

  timezone: string;
  locale: string;
}
