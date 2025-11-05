// src/components/ledger/LedgerToolbar.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Undo2, Redo2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LedgerToolbarProps {
  ledgerId: string;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
}

export default function LedgerToolbar({ ledgerId, title, setTitle }: LedgerToolbarProps) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");

  // ✏️ Save title
  const handleRename = async () => {
    if (!title.trim()) return;

    const { data: existing } = await supabase
        .from("ledgers")
        .select("icon")
        .eq("id", ledgerId)
        .single();

    await supabase
        .from("ledgers")
        .update({ name: title, icon: existing?.icon ?? "default-icon" })
        .eq("id", ledgerId);

    setEditing(false);
    };

  // 🔍 Placeholder search/replace logic
  const handleSearch = () => {
    console.log("Searching for:", search);
  };

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b shadow-sm">
      <div className="flex items-center justify-between h-11 px-3">
        
        {/* ← Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-primary"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        {/* 🏷️ Title / Rename */}
        <div className="flex-1 flex justify-center">
          {editing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              autoFocus
              className="w-52 text-center text-sm"
            />
          ) : (
            <div
              className="group flex items-center gap-1 cursor-pointer"
              onDoubleClick={() => setEditing(true)}
            >
              <span className="font-semibold text-gray-800 truncate max-w-[200px] text-center">
                {title}
              </span>
              <Pencil className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
            </div>
          )}
        </div>

        {/* 🔍 Search & ↩ Undo / Redo */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-32 h-8 text-sm pr-8"
            />
            <Search
              onClick={handleSearch}
              className="w-4 h-4 text-gray-500 absolute right-2 top-2 cursor-pointer"
            />
          </div>

          <Button variant="ghost" size="icon" title="Undo" className="text-gray-600 hover:text-primary">
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Redo" className="text-gray-600 hover:text-primary">
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
