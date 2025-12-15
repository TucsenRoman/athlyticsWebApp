// src/components/ledger/LedgerMenu.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/actions/button";
import {
  Settings2,
  CircleChevronLeft,
  Printer,
  FileText,
  Braces,
  FolderOutput,
  Copy,
  File,
  Eye,
  EyeOff,
  SquareArrowOutUpRight,
  Share2,
  Users,
  Lock,
  Minimize,
  Expand,
  Link2,
  ScanEye,
  Pin,
  Moon,
  Sun,
  FileSpreadsheet,
  Trash2,
  XCircle,
  Save,
  Rows3,
  Rows,
} from "lucide-react";
// import CopyLedger from "../CopyLedger";
// import MoveLedger from "../MoveLedger";

interface LedgerMenu {
  ledgerId: string;
  onExportCSV: () => void;
  onPrint: () => void;
  onToggleView: () => void;
  onExportPDF?: () => void;
  onExportPNG?: () => void;
  onExportJSON?: () => void;
  onTogglePinMode?: () => void;
}

export default function LedgerMenu({
  ledgerId,
  onExportCSV,
  onPrint,
  onToggleView,
  onExportPDF,
  onExportPNG,
  onExportJSON,
  onTogglePinMode,
}: LedgerMenu) {
  const [open, setOpen] = useState(false);
  const [activeNest, setActiveNest] = useState<string | null>(null);
  const [copyOpen, setCopyOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [pinActive, setPinActive] = useState(false);
  const [useAlternateRows, setUseAlternateRows] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const [fullscreen, setFullscreen] = useState(false);

  const ICON_SIZE = 18;
  const iconStyle = { width: ICON_SIZE, height: ICON_SIZE };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  /* --------------------- MENU --------------------- */
  const MENU_TREE: Record<string, any[]> = {
    Ledger: [
      {
        icon: <Printer style={iconStyle} />,
        label: "Print",
        action: onPrint,
        closeOnClick: true,
      },
      {
        icon: <Copy style={iconStyle} />,
        label: "Duplicate to Program",
        action: () => setCopyOpen(true),
        closeOnClick: true,
      },
      {
        icon: <FolderOutput style={iconStyle} />,
        label: "Move to Program",
        action: () => setMoveOpen(true),
        closeOnClick: true,
      },
      {
        icon: <Save style={iconStyle} />,
        label: "Save as Template",
        action: () => alert("Save as template feature coming soon."),
        closeOnClick: true,
      },
    ],
    View: [
      {
        icon: <ScanEye style={iconStyle} />,
        label: "Capture View",
        action: onToggleView,
        closeOnClick: true,
      },
      {
        icon:
          theme === "dark" ? (
            <Sun style={iconStyle} />
          ) : (
            <Moon style={iconStyle} />
          ),
        label: theme === "dark" ? "Light Mode" : "Dark Mode",
        action: toggleTheme,
        closeOnClick: false,
      },
      {
        icon: useAlternateRows
          ? <Rows style={iconStyle} />
          : <Rows3 style={iconStyle} />,

        label: useAlternateRows
          ? "Disable Alternating Rows"
          : "Enable Alternating Rows",

        // action: () => setUseAlternateRows(prev => !prev),
        closeOnClick: true,
      },
      {
        icon: fullscreen
          ? <Expand style={iconStyle} />   // or use Expand / Minimize icons if you prefer
          : <Minimize style={iconStyle} />,
        label: fullscreen ? "Exit Fullscreen" : "Fullscreen",
        // action: console.log("Fullscreen"),
        closeOnClick: true,
      }
    ],
    Export: [
      {
        icon: <FileSpreadsheet style={iconStyle} />,
        label: "CSV",
        action: onExportCSV,
        closeOnClick: true,
      },
      {
        icon: <FileText style={iconStyle} />,
        label: "PDF",
        action: onExportPDF,
        closeOnClick: true,
      },
      {
        icon: <Braces style={iconStyle} />,
        label: "JSON",
        action: onExportJSON,
        closeOnClick: true,
      },
    ],
    Share: [
      {
        icon: <Users style={iconStyle} />,
        label: "Community",
        action: () => alert("Community..."),
        closeOnClick: true,
      },
      {
        icon: <Lock style={iconStyle} />,
        label: "Permissions",
        action: () => alert("Permissions..."),
        closeOnClick: true,
      },
      {
        icon: <Link2 style={iconStyle} />,
        label: "Link",
        action: () => navigator.clipboard.writeText(window.location.href),
        closeOnClick: true,
      },
      {
        icon: <EyeOff style={iconStyle} />,
        label: "Lock/Hide Col",
        action: () => alert("Hide..."),
        closeOnClick: true,
      },
    ],
  };

  const ROOT_ACTIONS = [
    {
      icon: <File style={iconStyle} />,
      label: "Ledger Settings",
      nested: "Ledger",
      closeOnClick: false,
    },
    {
      icon: <Eye style={iconStyle} />,
      label: "View",
      nested: "View",
      closeOnClick: false,
    },
    {
      icon: <SquareArrowOutUpRight style={iconStyle} />,
      label: "Export",
      nested: "Export",
      closeOnClick: false,
    },
    {
      icon: <Share2 style={iconStyle} />,
      label: "Share",
      nested: "Share",
      closeOnClick: false,
    },
  ];

  /* -------------------- ARC RENDERING -------------------- */
  const renderArc = (items: any[], radius = 60) => (
    <AnimatePresence>
      {items.map((a, i) => {
        const totalArc = Math.PI / 2;
        const startAngle = -Math.PI / 2;
        const angle = startAngle + (i / (items.length - 1)) * totalArc;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * -1;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{ opacity: 1, x, y, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="absolute pointer-events-auto z-50"
          >
            <Button
              variant="ghost"
              size="icon"
              title={a.label}
              onClick={() => {
                if (a.nested) {
                  setActiveNest(a.nested);
                  setOpen(true);
                } else if (a.closeOnClick) {
                  setOpen(false);
                  setActiveNest(null);
                  setTimeout(() => a.action?.(), 100);
                } else {
                  a.action?.();
                }
              }}
              className="h-7 w-7 p-0 rounded-full bg-card shadow-md hover:bg-card"
            >
              {a.icon}
            </Button>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );

  /* -------------------- Main Orb Logic -------------------- */
  const handleMainClick = () => {
    if (activeNest) setActiveNest(null);
    else setOpen((prev) => !prev);
  };
  const isNested = !!activeNest;

  /* -------------------------- Render -------------------------- */
  return (
    <div
      className="relative flex items-center justify-center w-9 h-9 overflow-visible"
      style={{ zIndex: 9999 }}
    >
      {/* ⚙️ Standard Orb */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleMainClick}
        className={`h-8 w-8 p-0 rounded-full transition-all duration-300 ${
          open || activeNest
            ? "bg-[hsl(var(--primary))/0.25] ring-2 ring-[hsl(var(--primary))/0.6]"
            : "bg-card hover:bg-[hsl(var(--primary))/0.1]"
        }`}
      >
        <motion.div
          key={isNested ? "back" : "settings"}
          animate={{ rotate: isNested ? 0 : open ? -90 : 0, opacity: 1 }}
          initial={{ rotate: isNested ? -90 : 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {isNested ? (
            <CircleChevronLeft
              style={{ width: 24, height: 24, color: "hsl(var(--primary))" }}
            />
          ) : (
            <Settings2
              style={{ width: 20, height: 20, color: "hsl(var(--primary))" }}
            />
          )}
        </motion.div>
      </Button>

      {/* Modals */}
      {/* <CopyLedger open={copyOpen} onOpenChange={setCopyOpen} ledgerId={ledgerId} /> */}
      {/* <MoveLedger open={moveOpen} onOpenChange={setMoveOpen} ledgerId={ledgerId!} /> */}

      {/* Orbit menus */}
      {activeNest
        ? renderArc(MENU_TREE[activeNest], 70)
        : open && renderArc(ROOT_ACTIONS, 60)}
    </div>
  );
}
