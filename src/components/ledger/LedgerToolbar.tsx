import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  FileText,
  HelpCircle,
  ListTree,
  Route,
  Settings,
  Users,
} from "lucide-react";

const icons = {
  Users,
  FileText,
  Settings,
  Route,
  ListTree,
  HelpCircle,
};

interface Props {
  onBack: () => void;
}

export default function LedgerToolbar({ onBack }: Props) {
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const buttons = [
    { name: "Back", icon: "ArrowLeft", action: onBack, hideLabel: true },
    { name: "Community", icon: "Users" },
    { name: "File", icon: "FileText" },
    { name: "Route", icon: "Route" },
    { name: "Help", icon: "HelpCircle" },
  ];

  return (
    <div
      className="flex items-center border-b bg-card text-sm select-none h-10
      overflow-x-auto overflow-y-hidden px-2 sm:overflow-x-visible"
    >
      <div className="flex items-center gap-1 min-w-max">
        {buttons.map(({ name, icon, action, hideLabel }) => {
          const Icon = icons[icon] || ArrowLeft;
          return (
            <button
              key={name}
              onClick={() => {
                if (action) action();
                else setOpenDialog(name);
              }}
              className={`flex items-center gap-2 px-3 py-2 h-10 hover:bg-muted rounded-md transition snap-start
                ${menuCollapsed && window.innerWidth >= 640 ? "justify-center px-2" : ""}`}
              title={name === "Back" ? "Go back" : menuCollapsed ? name : ""}
            >
              <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
              {!hideLabel && (
                <AnimatePresence initial={false}>
                  {(!menuCollapsed || window.innerWidth < 640) && (
                    <motion.span
                      key={name}
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {name}
                    </motion.span>
                  )}
                </AnimatePresence>
              )}
            </button>
          );
        })}

        {/* Collapse / Expand Toggle */}
        <div className="hidden sm:flex items-center">
          <button
            onClick={() => setMenuCollapsed((p) => !p)}
            className="flex items-center gap-2 px-3 py-2 h-10 hover:bg-muted rounded-md transition text-muted-foreground"
            title={menuCollapsed ? "Expand menu" : "Collapse menu"}
          >
            <motion.div
              animate={{ rotate: menuCollapsed ? 180 : 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.div>
          </button>
        </div>
      </div>
    </div>
  );
}
