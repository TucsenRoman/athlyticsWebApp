import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileDown, FileText, Image, FileJson2, ArrowLeft } from "lucide-react";

interface ExportOrbProps {
  onCSV: () => void;
  onPDF: () => void;
  onPNG: () => void;
  onJSON: () => void;
}

export default function ExportOrb({ onCSV, onPDF, onPNG, onJSON }: ExportOrbProps) {
  const [open, setOpen] = useState(false);

  const actions = [
    { icon: <FileDown />, label: "CSV", action: onCSV },
    { icon: <FileText />, label: "PDF", action: onPDF },
    { icon: <Image />, label: "PNG", action: onPNG },
    { icon: <FileJson2 />, label: "JSON", action: onJSON },
    { icon: <ArrowLeft />, label: "Back", action: () => setOpen(false) },
  ];

  return (
    <div className="relative flex items-center justify-center w-8 h-8">
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 p-0 rounded-full transition ${
          open
            ? "bg-[hsl(22,94%,57%)]/20 ring-2 ring-[hsl(22,94%,57%)]/40"
            : "bg-white hover:bg-gray-100"
        }`}
        onClick={() => setOpen(!open)}
      >
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.25 }}>
          <FileDown className="w-4 h-4 text-[hsl(22,94%,57%)]" />
        </motion.div>
      </Button>

      <AnimatePresence>
        {open &&
          actions.map((a, i) => {
            const angle = (i / (actions.length - 1)) * Math.PI / 3 - Math.PI / 6; // ~60° arc
            const radius = 65;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * -radius;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{ opacity: 1, x, y, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="absolute"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  title={a.label}
                  onClick={() => {
                    a.action();
                    setOpen(false);
                  }}
                  className="h-7 w-7 rounded-full bg-white shadow-md hover:bg-[hsl(22,94%,57%)]/10"
                >
                  {a.icon}
                </Button>
              </motion.div>
            );
          })}
      </AnimatePresence>
    </div>
  );
}
