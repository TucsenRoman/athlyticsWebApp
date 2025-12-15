"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Divider } from "@/components/ui"

import {
  User,
  Paintbrush,
  Bell,
  ShieldCheck,
  Box,
  FlaskConical,
  CreditCard,
  MessageSquareHeart,
  LogOut,
  Trophy,
  Database,
  Archive,
  UserRound,
  BotMessageSquare,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/data_display/avatar";
import { Button } from "../ui/actions/button";

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function AccountMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      {/* TRIGGER ---------------------------------------------------------- */}
      <button
        onClick={() => setOpen(v => !v)}
        className="
          h-10 w-10 rounded-full overflow-hidden
          cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-[var(--accent)]
        "
      >
        <Avatar className="h-full w-full bg-[var(--gray-200)] hover:bg-[var(--gray-300)] transition-colors">
          <AvatarImage src="public/misc/profile-placeholder.jpg" />
          <AvatarFallback className="bg-[var(--accent)] text-white">
            TR
          </AvatarFallback>
        </Avatar>
      </button>

      {/* PANEL ------------------------------------------------------------ */}
      {open && (
        <div
          className="
            absolute right-0 mt-2 z-50
            flex flex-col gap-[2px]
            w-64 rounded-xl p-2
            bg-[var(--bg)]
            border border-[var(--border)]
            shadow-lg backdrop-blur-xl
            max-h-[70vh] overflow-y-auto
          "
        >
          {/* ACCOUNT HEADER ------------------------------------------------ */}
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 rounded-xl">
              <AvatarImage src="public/misc/profile-placeholder.jpg" />
              <AvatarFallback className="bg-[var(--gray-300)] rounded-xl">
                TR
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[var(--accent)] truncate">
                Tucsen Roman
              </div>

              <div className="flex items-center gap-1 text-[11px] text-[var(--text)]">
                <span className="truncate">@tucsenroman129</span>
                <span className="opacity-40">•</span>
                <Button
                  variant="none"
                  onClick={()=> console.log("TROPHIES")}
                >
                  <span className="flex items-center gap-1 text-[var(--fvr-yellow)] font-medium">
                    <Trophy className="h-3 w-3" />
                    57
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <Divider />

          {/* SETTINGS ----------------------------------------------------- */}
          <MenuItem icon={<UserRound />} label="Profile" onClick={() => go("/settings/profile")} />
          <MenuItem icon={<Paintbrush />} label="Appearance" onClick={() => go("/settings/appearance")} />
          <MenuItem icon={<Bell />} label="Notifications" onClick={() => go("/settings/notifications")} />
          <MenuItem icon={<ShieldCheck />} label="Security" onClick={() => go("/settings/security")} />
          <MenuItem icon={<Archive />} label="Storage" onClick={() => go("/settings/storage")} />
          <MenuItem icon={<FlaskConical />} label="Experiments" onClick={() => go("/settings/experiments")} />
          <MenuItem icon={<CreditCard />} label="Plan & Billing" onClick={() => go("/settings/billing")} />
          <MenuItem icon={<MessageSquareHeart />} label="Support" onClick={() => go("/settings/support")} />
          <MenuItem icon={<BotMessageSquare />} label="AI Assistant" onClick={() => go("/settings/aiassistant")} />

          <Divider />

          {/* LOGOUT ------------------------------------------------------- */}
          <MenuItem
            icon={<LogOut />}
            label="Log out"
            danger
            onClick={async () => {
              await signOut();
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ========================================================================== */
/* SUBCOMPONENTS                                                             */
/* ========================================================================== */

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        group w-full flex items-center gap-2
        px-3 py-2 rounded-md
        text-left cursor-pointer
        transition-colors hover:shadow-inner

        ${
          danger
            ? "text-[var(--text-dark)] hover:bg-[var(--danger-bg)]"
            : "text-[var(--text-dark)] hover:bg-[var(--gray-200)]"
        }
      `}
    >
      {/* ICON */}
      <span
        className={`
          transition-colors
          ${
            danger
              ? "text-[var(--text-dark)] group-hover:text-[var(--danger)]"
              : "text-[var(--text)]"
          }
        `}
      >
        {icon}
      </span>

      {/* LABEL */}
      <span
        className={`
          text-sm transition-colors
          ${
            danger
              ? "group-hover:text-[var(--danger)]"
              : ""
          }
        `}
      >
        {label}
      </span>
    </button>
  );
}
