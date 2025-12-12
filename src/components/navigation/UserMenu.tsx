"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuShortcut,
} from "@/components/ui/overlays/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/data_display/avatar";

import {
  LogOut,
  MessageSquareHeart,
  Bell,
  Gauge,
  Activity,
  ListChecks,
  Database,
  LineChart,
  Dumbbell,
  LayoutDashboard,
  ClipboardList,
  Users,
  ShieldCheck,
  MonitorSmartphone,
  Sun,
  Moon,
  Trophy,
  Box,
  Settings,
} from "lucide-react";

/* ============================================================== */
/* MAIN COMPONENT                                                 */
/* ============================================================== */

export default function UserDropdownShell() {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {/* TRIGGER ----------------------------------------------------------- */}
      <DropdownMenuTrigger className="flex items-center h-10 w-10 rounded-full overflow-hidden">
        <Avatar className="h-full w-full bg-[var(--gray-200)] hover:bg-[var(--gray-300)] transition">
          <AvatarImage src="public/IMG_0136.jpg" className="rounded-sm" />
          <AvatarFallback className="bg-[var(--accent)] text-white rounded-sm">
            TR
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      {/* CONTENT ----------------------------------------------------------- */}
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="
          w-72 rounded-xl p-1
          bg-[var(--bg)]
          text-[var(--text-dark)]
          border border-[var(--border)]
          backdrop-blur-xl
        "
      >
        {/* PROFILE --------------------------------------------------------- */}
        <div className="px-3 py-3 flex items-center gap-3">
          <Avatar className="h-11 w-11 rounded-xl">
            <AvatarImage src="public/IMG_0136.jpg" />
            <AvatarFallback className="bg-[var(--gray-300)] text-[var(--text-dark)] rounded-xl">
              U
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex flex-col">
            <div className="font-semibold text-[var(--accent)] truncate">
              Tucsen Roman
            </div>

            <div className="flex items-center gap-1 text-[10px] text-[var(--text)]">
              <span className="truncate">@tucsenroman129</span>
              <span className="opacity-40">•</span>
              <span className="truncate">57 Trophies</span>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* NAVIGATION ------------------------------------------------------- */}
        <DropdownMenuLabel className="text-xs text-[var(--accent)] px-3">
          Navigation
        </DropdownMenuLabel>

        <DropdownMenuGroup>
          {menuNavItem(<LayoutDashboard className="h-4 w-4 lucide-bold" />, "Dashboard")}
          {menuNavItem(<Users className="h-4 w-4 lucide-bold" />, "Athletes")}
          {menuNavItem(<ClipboardList className="h-4 w-4 lucide-bold" />, "Meets & Events")}
          {menuNavItem(<LineChart className="h-4 w-4 lucide-bold" />, "Performance Analytics")}
          {menuNavItem(<Dumbbell className="h-4 w-4 lucide-bold" />, "Training Programs")}
          {menuNavItem(<ListChecks className="h-4 w-4 lucide-bold" />, "Rosters & Uniforms")}
          {menuNavItem(<Database className="h-4 w-4 lucide-bold" />, "Ledger Manager")}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* TOOLS ------------------------------------------------------------ */}
        <DropdownMenuLabel className="text-xs text-[var(--accent)] px-3">
          Tools
        </DropdownMenuLabel>

        <DropdownMenuGroup>
          {menuNavItem(<Gauge className="h-4 w-4 lucide-bold" />, "VRP Mode")}
          {menuNavItem(<Activity className="h-4 w-4 lucide-bold" />, "Live Meet Mode")}
          {menuNavItem(<ShieldCheck className="h-4 w-4 lucide-bold" />, "Permissions")}
          {menuNavItem(<Box className="h-4 w-4 lucide-bold" />, "Storage")}
          {menuNavItem(<Trophy className="h-4 w-4 lucide-bold" />, "Trophies")}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* SETTINGS --------------------------------------------------------- */}
        <DropdownMenuLabel className="text-xs text-[var(--accent)] px-3">
          App
        </DropdownMenuLabel>

        <DropdownMenuGroup>
          {/* Theme */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <MonitorSmartphone className="h-4 w-4 text-[var(--text)]" />
              Theme
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent className="bg-[var(--bg)] border border-[var(--border)]">
              {themeItem(<Sun className="h-4 w-4" />, "Light")}
              {themeItem(<Moon className="h-4 w-4" />, "Dark")}
              {themeItem(<MonitorSmartphone className="h-4 w-4" />, "System")}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {menuNavItem(<Settings className="h-4 w-4 lucide-bold" />, "Settings")}
          {menuNavItem(<Bell className="h-4 w-4 text-[var(--text)]" />, "Notifications", "5")}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* SUPPORT ---------------------------------------------------------- */}
        <DropdownMenuItem className="gap-2 hover:bg-[var(--gray-200)] transition">
          <MessageSquareHeart className="h-4 w-4 text-[var(--text)]" />
          Help Center
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* LOGOUT ----------------------------------------------------------- */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="
            gap-2
            text-[var(--danger)]
            hover:bg-[var(--danger-bg)]
            transition
          "
        >
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ============================================================== */
/* HELPERS                                                        */
/* ============================================================== */

function menuNavItem(icon: any, label: string, shortcut?: string) {
  return (
    <DropdownMenuItem
      className="
        gap-2
        text-[var(--text-dark)]
        hover:bg-[var(--gray-200)]
        transition
      "
    >
      <span className="text-[var(--text)]">{icon}</span>
      {label}
      {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
    </DropdownMenuItem>
  );
}

function themeItem(icon: any, label: string) {
  return (
    <DropdownMenuItem
      className="
        gap-2
        hover:bg-[var(--gray-200)]
        transition
      "
    >
      <span className="text-[var(--text)]">{icon}</span>
      {label}
    </DropdownMenuItem>
  );
}
