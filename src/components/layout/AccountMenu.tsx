"use client";

import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SETTINGS_NAV } from "@/features/user-scope/settings/settingsNav"

import { LogOut, Share, Share2 } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/data_display/avatar";
import { Divider, Button } from "@/components/ui";

import { useProfileContext } from "@/features/user-scope/profile/ProfileProvider"
import { AVATAR_MAP } from "@/features/user-scope/profile/avatarMap"

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function AccountMenu() {
  const { user, username, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  /* ---------------------------------------------------------------------- */
  /* CLOSE ON OUTSIDE CLICK (AUTH ONLY)                                      */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!open || !user) return;

    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, user]);

  if (loading) return null;

  // SHARE ACCOUNT
  function shareAccount({
    name,
    username,
    email,
  }: {
    name: string
    username: string
    email: string
  }) {
    const text = `${name} (@${username})\n${email}`

    if (navigator.share) {
      navigator.share({
        title: `${name}'s Account`,
        text,
      }).catch(() => {
        /* user cancelled — ignore */
      })
    } else {
      navigator.clipboard.writeText(text)
    }
  }

  /* ---------------------------------------------------------------------- */
  /* DERIVED USER DATA                                                       */
  /* ---------------------------------------------------------------------- */

  const displayName =
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "Account";

  const { profile } = useProfileContext()

  const avatarId = profile?.avatarUrl ?? null
  const avatarSrc =
    avatarId && AVATAR_MAP[avatarId]
      ? AVATAR_MAP[avatarId]
      : null

  const initials = displayName
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* AUTHENTICATED RENDER */
  return (
    <div className="relative" ref={menuRef}>
      {/* TRIGGER */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          overflow-hidden
        "
      >
        <Avatar className="h-full w-full rounded-full">
          <AvatarImage
            src={avatarSrc ?? undefined}
            className="h-10 w-10"
          />

          {/* OUTER PILL (matches nav pill shell) */}
          <AvatarFallback
            className="
              h-10 w-12
              flex items-center justify-center
              rounded-full
              bg-[var(--gray-lt)]
            "
          >
            {/* INNER PILL */}
            <div
              className={`
                flex items-center justify-center
                h-8 w-10
                rounded-full
                font-semibold
                text-base
                transition-colors
                ${
                  open
                    ? "bg-[var(--accent-glass)] text-[var(--accent)]"
                    : "bg-transparent text-[var(--text2)] hover:bg-[var(--gray-lt2)]"
                }
              `}
            >
              {initials}
            </div>
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
            flex flex-col gap-1
          "
        >
          {/* HEADER */}
          <div className="flex flex-col gap-3 px-2 py-2">
            {/* TOP ROW */}
            <div className="flex items-center gap-3">
              <Avatar
                className="h-14 w-14 rounded-xl cursor-pointer"
                onClick={() => go("/settings/profile")}
              >
                {avatarSrc && <AvatarImage src={avatarSrc} />}
                <AvatarFallback className="bg-[var(--gray-300)] rounded-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex justify-start gap-2 font-semibold text-[var(--text-dark)] truncate">
                  {displayName}
                </div>

                <div className="flex justify-start items-center gap-2 text-xs text-[var(--text-muted)] truncate">
                  <span className="truncate">{username}</span>
                  {/* <button
                    className="
                      flex justify-center items-center
                      h-5 w-5
                      text-[var(--text)]
                      hover:text-[var(--text2)]
                      transition-all
                    "
                    onClick={() =>
                      shareAccount({
                        name: displayName,
                        username: username ?? "",
                        email: user.email ?? "",
                      })
                    }
                  >
                    <Share2 className="h-3 w-3" />
                  </button> */}
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* SETTINGS */}
          {SETTINGS_NAV
            .filter((item) => item.enabled !== false)
            .map((item) => (
              <MenuItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                onClick={() => go(item.route)}
              />
            ))}

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
        w-full flex items-center gap-2
        px-3 py-2 rounded-md
        text-left transition-colors
        ${danger ? "hover:bg-[var(--danger-bg)]" : "hover:bg-[var(--gray-lt)]"}
      `}
    >
      <span className={danger ? "text-[var(--danger)]" : "text-[var(--text2)]"}>
        {icon}
      </span>
      <span className={`text-sm font-semibold ${danger ? "text-[var(--danger)]" : "text-[var(--text2)]"}`}>
        {label}
      </span>
    </button>
  );
}
