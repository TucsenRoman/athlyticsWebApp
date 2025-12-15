// src/features/user-settings/UserSettingsContext.tsx
"use client";

import React, { createContext, useContext, useState } from "react";
import { DEFAULT_USER_SETTINGS } from "./defaults";
import type { UserSettings } from "./types";

interface UserSettingsContextValue {
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
}

const UserSettingsContext =
  createContext<UserSettingsContextValue | null>(null);

export function UserSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<UserSettings>(
    DEFAULT_USER_SETTINGS
  );

  const updateSettings = (patch: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  return (
    <UserSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettingsContext() {
  const ctx = useContext(UserSettingsContext);
  if (!ctx) {
    throw new Error(
      "useUserSettingsContext must be used within UserSettingsProvider"
    );
  }
  return ctx;
}
