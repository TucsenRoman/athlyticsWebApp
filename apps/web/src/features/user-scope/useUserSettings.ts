// src/features/user-settings/useUserSettings.ts
import { useUserSettingsContext } from "./UserSettingsContext";

export function useUserSettings() {
  const { settings, updateSettings } = useUserSettingsContext();

  return {
    settings,
    setDensity: (uiDensity: typeof settings.uiDensity) =>
      updateSettings({ uiDensity }),

    setDefaultWorkspaceMode: (
      mode: typeof settings.defaultWorkspaceMode
    ) => updateSettings({ defaultWorkspaceMode: mode }),

    setNotifications: (patch: {
      notifySystem?: boolean;
      notifyProgram?: boolean;
      notifyMessages?: boolean;
    }) => updateSettings(patch),
  };
}
