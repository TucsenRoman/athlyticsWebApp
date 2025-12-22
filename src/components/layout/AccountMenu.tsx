"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  UserRound,
  Paintbrush,
  Bell,
  ShieldCheck,
  Archive,
  FlaskConical,
  CreditCard,
  MessageSquareHeart,
  BotMessageSquare,
  LogOut,
  User,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/data_display/avatar";
import { Button } from "@/components/ui/actions/button";
import { Divider } from "@/components/ui";

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function AccountMenu() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  /* ---------------------------------------------------------------------- */
  /* CLOSE ON OUTSIDE CLICK                                                  */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (loading) return null;

  /* ---------------------------------------------------------------------- */
  /* DERIVED USER DATA                                                       */
  /* ---------------------------------------------------------------------- */

  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "Account";

  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  const initials = displayName
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="relative" ref={menuRef}>
      {/* TRIGGER ---------------------------------------------------------- */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          h-10 w-10 rounded-full overflow-hidden
          focus:outline-none focus:ring-2 focus:ring-[var(--accent)]
        "
      >
        <Avatar className="h-full w-full bg-[var(--gray-200)]">
          {avatarUrl && <AvatarImage src={avatarUrl} />}
          <AvatarFallback className="bg-[var(--accent)] text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </button>

      {/* PANEL ------------------------------------------------------------ */}
      {open && (
        <div
          className="
            absolute right-0 mt-2 z-50
            w-64 rounded-xl p-2
            bg-[var(--bg)]
            border border-[var(--border)]
            shadow-lg backdrop-blur-xl
            flex flex-col gap-[2px]
          "
        >
          {/* ===================== LOGGED OUT ===================== */}
          {!user && (
            <>
              <MenuItem
                icon={<User />}
                label="Sign in"
                onClick={() => go("/login")}
              />
              <MenuItem
                icon={<UserRound />}
                label="Create account"
                onClick={() => go("/signup")}
              />
            </>
          )}

          {/* ===================== LOGGED IN ====================== */}
          {user && (
            <>
              {/* HEADER */}
              <div className="flex items-center gap-3 px-2 py-2">
                <Avatar className="h-11 w-11 rounded-xl">
                  {avatarUrl && <AvatarImage src={avatarUrl} />}
                  <AvatarFallback className="bg-[var(--gray-300)] rounded-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[var(--accent)] truncate">
                    {displayName}
                  </div>
                  <div className="text-[11px] text-[var(--text)] truncate">
                    {user.email}
                  </div>
                </div>
              </div>

              <Divider />

              {/* SETTINGS */}
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

              {/* LOGOUT */}
              <MenuItem
                icon={<LogOut />}
                label="Log out"
                danger
                onClick={async () => {
                  await signOut();
                  setOpen(false);
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ========================================================================== */
/* SUBCOMPONENT                                                              */
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
        transition-colors
        ${
          danger
            ? "hover:bg-[var(--danger-bg)]"
            : "hover:bg-[var(--gray-200)]"
        }
      `}
    >
      <span
        className={
          danger
            ? "text-[var(--danger)]"
            : "text-[var(--text)]"
        }
      >
        {icon}
      </span>
      <span
        className={`text-sm ${
          danger ? "text-[var(--danger)]" : ""
        }`}
      >
        {label}
      </span>
    </button>
  );
}
