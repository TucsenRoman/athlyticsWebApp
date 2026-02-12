"use client";

import { NavLink, Outlet } from "react-router-dom";

export default function SettingsLayout() {
  return (
    <div className="relative flex h-full min-h-0 shadow-inner overflow-y-auto overflow-x-hidden scrollbar">
      <Outlet />
    </div>
  );
}
