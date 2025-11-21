import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  User,
  Settings,
  LogOut,
  MessageSquareHeart,
  Bell,
  Wallet,
  TrendingUp,
  ChevronDown,
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
  Moon,
  Sun,
  MonitorSmartphone,
} from "lucide-react";

interface UserDropdownShellProps {
  onSignOut: () => void | Promise<void>;
}

export default function UserDropdownShell({ onSignOut }: UserDropdownShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="flex items-center h-[2.375rem] w-[2.375rem]">
        <Avatar className="h-full w-full hover:bg-primary/30 border border-primary/40 transition-all select-none">
          <AvatarImage src="public/IMG_0136.jpg" className="rounded-sm" />
          <AvatarFallback className="bg-primary/40 text-primary-foreground rounded-sm">TR</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 rounded-xl border border-primary/40 bg-background/95 backdrop-blur-lg p-1 shadow-xl"
      >
        {/* Profile Summary */}
        <div className="px-3 py-3 flex items-center gap-3">
          <Avatar className="h-11 w-11 rounded-xl">
            <AvatarImage src="public/IMG_0136.jpg" className="rounded-sm" />
            <AvatarFallback className="bg-primary/40 text-primary-foreground rounded-sm">U</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex flex-col">
            <div className="font-semibold text-primary truncate">Tucsen Roman</div>

            <div className="flex items-center gap-1 text-[10px] text-accent">
              <span className="truncate">tucsenroman129</span>
              <span className="opacity-50">•</span>
              <span className="truncate">57 Trophies</span>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* ATHLYTICS NAVIGATION */}
        <DropdownMenuLabel className="text-xs text-accent px-3">Athlytics Navigation</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2 hover:bg-primary/20">
            <LayoutDashboard className="h-4 w-4 text-primary" /> Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 hover:bg-primary/20">
            <Users className="h-4 w-4 text-primary" /> Athletes
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 hover:bg-primary/20">
            <ClipboardList className="h-4 w-4 text-primary" /> Meets & Events
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 hover:bg-primary/20">
            <LineChart className="h-4 w-4 text-primary" /> Performance Analytics
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 hover:bg-primary/20">
            <Dumbbell className="h-4 w-4 text-primary" /> Training Programs
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 hover:bg-primary/20">
            <ListChecks className="h-4 w-4 text-primary" /> Rosters & Uniforms
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 hover:bg-primary/20">
            <Database className="h-4 w-4 text-primary" /> Ledger Manager
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* TOOLS */}
        <DropdownMenuLabel className="text-xs text-accent px-3">Tools</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2 hover:bg-primary/20">
            <Gauge className="h-4 w-4 text-accent" /> VRP Mode
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 hover:bg-primary/20">
            <Activity className="h-4 w-4 text-accent" /> Live Meet Mode
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 hover:bg-primary/20">
            <ShieldCheck className="h-4 w-4 text-accent" /> Permissions
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* SETTINGS */}
        <DropdownMenuLabel className="text-xs text-accent px-3">App</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <MonitorSmartphone className="h-4 w-4 text-primary" /> Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem className="gap-2 hover:bg-primary/20"><Sun className="h-4 w-4 text-primary" /> Light</DropdownMenuItem>
              <DropdownMenuItem className="gap-2 hover:bg-primary/20"><Moon className="h-4 w-4 text-primary" /> Dark</DropdownMenuItem>
              <DropdownMenuItem className="gap-2 hover:bg-primary/20"><MonitorSmartphone className="h-4 w-4 text-primary" /> System</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem className="gap-2 hover:bg-primary/20">
            <Settings className="h-4 w-4 text-primary" /> Settings
          </DropdownMenuItem>

          <DropdownMenuItem className="gap-2 hover:bg-primary/20">
            <Bell className="h-4 w-4 text-primary" /> Notifications
            <DropdownMenuShortcut>5</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* SUPPORT */}
        <DropdownMenuItem className="gap-2 hover:bg-primary/20">
          <MessageSquareHeart className="h-4 w-4 text-primary" /> Help Center
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* LOGOUT */}
        <DropdownMenuItem
          onClick={onSignOut}
          className="gap-2 text-red-400 focus:text-red-500 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
