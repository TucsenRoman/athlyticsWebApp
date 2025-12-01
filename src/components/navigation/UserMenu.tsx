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
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  User,
  Settings,
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
  Sparkles,
} from "lucide-react";

export default function UserDropdownShell() {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {/* TRIGGER ------------------------------------------------------------- */}
      <DropdownMenuTrigger className="flex items-center h-10 w-10 rounded-full overflow-hidden">
        <Avatar className="h-full w-full bg-[hsl(var(--gray-200))] hover:bg-[hsl(var(--gray-300))] transition">
          <AvatarImage src="public/IMG_0136.jpg" className="rounded-sm" />
          <AvatarFallback className="bg-[hsl(var(--accent))] text-white rounded-sm">
            TR
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      {/* CONTENT ------------------------------------------------------------- */}
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="
          w-72 rounded-xl p-1 shadow-xl
          bg-[hsl(var(--card))] 
          text-[hsl(var(--card-foreground))]
          border border-[hsl(var(--border))]
          backdrop-blur-lg
        "
      >
        {/* PROFILE SUMMARY --------------------------------------------------- */}
        <div className="px-3 py-3 flex items-center gap-3">
          <Avatar className="h-11 w-11 rounded-xl">
            <AvatarImage src="public/IMG_0136.jpg" />
            <AvatarFallback className="bg-[hsl(var(--gray-300))] text-[hsl(var(--gray-800))] rounded-xl">
              U
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex flex-col">
            <div className="font-semibold text-[hsl(var(--accent))] truncate">
              Tucsen Roman
            </div>

            <div className="flex items-center gap-1 text-[10px] text-[hsl(var(--gray-500))]">
              <span className="truncate">@tucsenroman129</span>
              <span className="opacity-40">•</span>
              <span className="truncate">57 Trophies</span>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* NAVIGATION ------------------------------------------------------- */}
        <DropdownMenuLabel className="text-xs text-[hsl(var(--accent))] px-3">
          Navigation
        </DropdownMenuLabel>

        <DropdownMenuGroup>
          {menuNavItem(<LayoutDashboard className="h-4 w-4" />, "Dashboard")}
          {menuNavItem(<Users className="h-4 w-4" />, "Athletes")}
          {menuNavItem(<ClipboardList className="h-4 w-4" />, "Meets & Events")}
          {menuNavItem(<LineChart className="h-4 w-4" />, "Performance Analytics")}
          {menuNavItem(<Dumbbell className="h-4 w-4" />, "Training Programs")}
          {menuNavItem(<ListChecks className="h-4 w-4" />, "Rosters & Uniforms")}
          {menuNavItem(<Database className="h-4 w-4" />, "Ledger Manager")}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* TOOLS ------------------------------------------------------------ */}
        <DropdownMenuLabel className="text-xs text-[hsl(var(--accent))] px-3">
          Tools
        </DropdownMenuLabel>

        <DropdownMenuGroup>
          {menuNavItem(<Gauge className="h-4 w-4" />, "VRP Mode")}
          {menuNavItem(<Activity className="h-4 w-4" />, "Live Meet Mode")}
          {menuNavItem(<ShieldCheck className="h-4 w-4" />, "Permissions")}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* SETTINGS --------------------------------------------------------- */}
        <DropdownMenuLabel className="text-xs text-[hsl(var(--accent))] px-3">
          App
        </DropdownMenuLabel>

        <DropdownMenuGroup>
          {/* Theme Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <MonitorSmartphone className="h-4 w-4 text-[hsl(var(--gray-600))]" />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
              {themeItem(<Sun className="h-4 w-4" />, "Light")}
              {themeItem(<Moon className="h-4 w-4" />, "Dark")}
              {themeItem(<MonitorSmartphone className="h-4 w-4" />, "System")}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {menuNavItem(<Settings className="h-4 w-4" />, "Settings")}
          {menuNavItem(
            <Bell className="h-4 w-4 text-[hsl(var(--gray-600))]" />,
            "Notifications",
            "5"
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* SUPPORT ---------------------------------------------------------- */}
        <DropdownMenuItem className="gap-2 hover:bg-[hsl(var(--gray-200))] transition">
          <MessageSquareHeart className="h-4 w-4 text-[hsl(var(--gray-600))]" />
          Help Center
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* LOGOUT ----------------------------------------------------------- */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="
            gap-2
            text-[hsl(var(--danger))]
            hover:bg-[hsl(var(--danger))]/10
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

/* HELPERS ================================================================== */

function menuNavItem(icon: any, label: string, shortcut?: string) {
  return (
    <DropdownMenuItem
      className="
        gap-2
        hover:bg-[hsl(var(--gray-200))]
        text-[hsl(var(--gray-700))]
        transition
      "
    >
      <span className="text-[hsl(var(--gray-600))]">{icon}</span>
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
        hover:bg-[hsl(var(--gray-200))]
        transition
      "
    >
      <span className="text-[hsl(var(--gray-600))]">{icon}</span>
      {label}
    </DropdownMenuItem>
  );
}
