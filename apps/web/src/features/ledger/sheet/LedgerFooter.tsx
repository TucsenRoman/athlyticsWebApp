import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Info, Sigma, UserCheck, Bot } from "lucide-react";

export default function LedgerFooter() {
  const [collapsed, setCollapsed] = useState(false);
  const isExpanded = !collapsed;

  return (
    <motion.footer
      layout
      className={`fixed bottom-0 left-0 right-0 border-t border-border text-sm z-50 backdrop-blur-md transition-colors duration-300
        ${isExpanded ? "bg-primary/70 text-primary-foreground" : "bg-background/90 text-foreground"}`}
    >
      <AnimatePresence initial={false}>
        {isExpanded ? (
          // --- Expanded Footer ---
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-9 divide-x divide-border/30 text-[11px] font-medium h-10"
          >
            <div className="flex items-center justify-center gap-1.5 hover:bg-primary/90 transition">
              <UserCheck className="w-3 h-3 opacity-90" />
              <span>last updated & by who</span>
            </div>

            <div className="flex items-center justify-center gap-1.5 hover:bg-primary/90 transition">
              <Info className="w-3 h-3 opacity-90" />
              <span>accessibility</span>
            </div>

            <div className="col-span-4 flex items-center justify-center gap-1.5 hover:bg-primary/90 transition">
              <Sigma className="w-3 h-3 opacity-90" />
              <span>avg, sum, difference, etc.</span>
            </div>

            <div className="col-span-2 flex items-center justify-center gap-1.5 hover:bg-primary/90 transition">
              <Bot className="w-3 h-3 opacity-90" />
              <span>Help (AI)</span>
            </div>

            <div className="flex items-center justify-end pr-3">
              <button
                onClick={() => setCollapsed(true)}
                className="flex items-center justify-center gap-1 px-2 py-1 text-xs rounded-md border border-primary-foreground/30 bg-primary hover:bg-primary/60 transition text-primary-foreground"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ) : (
          // --- Collapsed Footer ---
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-end px-3 text-[10.5px] font-medium tracking-wide select-none h-7"
          >
            <button
              onClick={() => setCollapsed(false)}
              className="flex items-center justify-center gap-1 px-2 py-0.5 rounded-md border border-border/40 hover:bg-muted/60 transition text-foreground"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.footer>
  );
}
