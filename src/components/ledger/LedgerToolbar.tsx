import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Star,
  UserLock,
  UserPen,
  UserCheck,
  UserX,
  UserCog,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LedgerToolbarProps {
  ledgerId: string;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
}

interface Program {
  id: string;
  sport: string;
  season_year: string;
  school: string;
}

type UserState = "locked" | "editing" | "confirmed" | "restricted" | "admin";

export default function LedgerToolbar({
  ledgerId,
  title,
  setTitle,
}: LedgerToolbarProps) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [starred, setStarred] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [program, setProgram] = useState<Program | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userState, setUserState] = useState<UserState>("editing");

  // 🔁 Load ledger + program + user
  useEffect(() => {
    const fetchData = async () => {
      const { data: ledger, error: ledgerError } = await supabase
        .from("ledgers")
        .select("favorite, program_id")
        .eq("id", ledgerId)
        .single();

      if (ledgerError) {
        console.error("Ledger fetch error:", ledgerError);
        return;
      }

      setStarred(ledger.favorite ?? false);

      // 🏫 Program info
      if (ledger.program_id) {
        const { data: programData, error: programError } = await supabase
          .from("programs")
          .select("id, sport, season_year, school")
          .eq("id", ledger.program_id)
          .single();
        if (!programError && programData) setProgram(programData);
      }

      // 👤 User info
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (!profileError && profileData?.full_name) {
          setUserName(profileData.full_name);
        } else {
          setUserName("Unknown User");
        }
      }
    };

    if (ledgerId) fetchData();
  }, [ledgerId]);

  // ✏️ Rename
  const handleRename = async () => {
    if (!title.trim()) return;

    const { data: existing } = await supabase
      .from("ledgers")
      .select("icon, favorite")
      .eq("id", ledgerId)
      .single();

    await supabase
      .from("ledgers")
      .update({
        name: title,
        icon: existing?.icon ?? "default-icon",
        favorite: existing?.favorite ?? false,
      })
      .eq("id", ledgerId);

    setEditing(false);
  };

  // ⭐ Toggle favorite
  const toggleStar = async () => {
    const newStatus = !starred;
    setStarred(newStatus);
    if (newStatus) {
      setPulse(true);
      setTimeout(() => setPulse(false), 400);
    }

    const { data: existing, error: fetchError } = await supabase
      .from("ledgers")
      .select("icon")
      .eq("id", ledgerId)
      .single();

    if (fetchError) {
      console.error("Failed to fetch icon:", fetchError);
      return;
    }

    const { error } = await supabase
      .from("ledgers")
      .update({ favorite: newStatus, icon: existing?.icon ?? "default-icon" })
      .eq("id", ledgerId);

    if (error) {
      console.error("Failed to update favorite:", error);
      setStarred(!newStatus);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border/60 shadow-sm">
        <div className="flex items-center justify-between h-10 px-2 sm:px-3 text-sm w-full">
          {/* ← LEFT SIDE */}
          <div className="flex items-center gap-1.5 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (window.history.state && window.history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate("/"); // fallback route (e.g., dashboard)
                }
              }}
              className="text-gray-600 hover:text-[hsl(var(--primary))]"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            {/* 🏫 Program */}
            {program && (
              <div className="pl-2 border-l border-border/60 flex flex-col leading-tight">
                <span className="font-medium text-gray-800 text-[13px]">
                  {program.sport} • {program.season_year}
                </span>
              </div>
            )}

            <div className="w-px h-4 bg-gray-300 mx-2" />

            {/* Title */}
            {editing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
                autoFocus
                className="w-44 h-7 text-sm px-2 py-1 bg-transparent 
                          border border-border/60 rounded-sm
                          focus-visible:ring-0 focus:border-[hsl(var(--primary))]
                          font-semibold text-gray-800"
              />
            ) : (
              <div
                className="group flex items-center gap-1 cursor-pointer"
                onDoubleClick={() => setEditing(true)}
              >
                <span className="font-semibold text-gray-800 truncate max-w-[180px] leading-none">
                  {title}
                </span>
              </div>
            )}


            {/* ⭐ */}
            <motion.button
              onClick={toggleStar}
              animate={{ scale: starred ? [1, 2, 1] : 1 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className={`relative ml-1 transition ${
                starred
                  ? "text-[hsl(var(--primary))]"
                  : "text-gray-400 hover:text-[hsl(var(--primary))]"
              }`}
              title={starred ? "Unstar" : "Star"}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  starred ? "fill-[hsl(var(--primary))]" : ""
                }`}
              />
              <AnimatePresence>
                {pulse && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    initial={{ opacity: 0.4, scale: 1 }}
                    animate={{ opacity: 0, scale: 2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{
                      background:
                        "radial-gradient(circle, hsl(var(--primary)) 30%, transparent 70%)",
                      filter: "blur(2px)",
                      zIndex: -1,
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* → RIGHT SIDE */}
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 select-none">
            <span className="truncate max-w-[140px]">{userName}</span>

            {/* 🧠 Dynamic user state icon */}
            {userState === "locked" && (
              <UserLock className="w-4 h-4 text-gray-500" aria-label="View Only" />
            )}
            {userState === "editing" && (
              <UserPen className="w-4 h-4 text-500" aria-label="Editing Mode" />
            )}
            {userState === "confirmed" && (
              <UserCheck
                className="w-4 h-4 text-green-600"
                aria-label="Edits Confirmed"
              />
            )}
            {userState === "restricted" && (
              <UserX
                className="w-4 h-4 text-red-500"
                aria-label="Access Restricted"
              />
            )}
            {userState === "admin" && (
              <UserCog className="w-4 h-4 text-500" aria-label="Admin Mode" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
