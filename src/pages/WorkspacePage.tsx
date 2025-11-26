"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProgramContext } from "@/hooks/useProgramContext";

import { MoreVertical, FileSpreadsheet, X } from "lucide-react";

import WorkspaceMenu from "@/components/workspace/WorkspaceMenu";
import ProjectSidebar from "@/components/projectmanager/ProjectSidebar";
import WorkspaceOverview from "@/components/workspace/WorkspaceOverview";
import WorkspaceEditor from "@/components/workspace/WorkspaceEditor";
import RouteManager from "@/components/workspace/WorkspaceRouteManager";
import WorkspaceProjectPerms from "@/components/workspace/WorkspaceProjectPerms";

const TOP_TABS = ["Overview", "Editor", "Routes", "Permissions"] as const;
type TopTab = (typeof TOP_TABS)[number];

export default function WorkspacePage() {
  const { selectedProgramId } = useProgramContext();

  /* ---------------------------------------------------------------------- */
  /* LEDGERS                                                                */
  /* ---------------------------------------------------------------------- */

  const [ledgers, setLedgers] = useState<any[]>([]);
  const [loadingLedgers, setLoadingLedgers] = useState(true);

  useEffect(() => {
    async function load() {
      if (!selectedProgramId) {
        setLedgers([]);
        setLoadingLedgers(false);
        return;
      }

      const { data } = await supabase
        .from("ledgers")
        .select("*")
        .eq("program_id", selectedProgramId)
        .order("created_at", { ascending: false });

      setLedgers(data || []);
      setLoadingLedgers(false);
    }

    load();
  }, [selectedProgramId]);

  /* ---------------------------------------------------------------------- */
  /* WORKSPACE TAB / STATE                                                  */
  /* ---------------------------------------------------------------------- */

  const [openTabs, setOpenTabs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [topTab, setTopTab] = useState<TopTab>("Overview");

  const activeLedger =
    openTabs.find((t) => t.id === activeTab) ?? null;

  /* ---------------------------------------------------------------------- */
  /* OPEN ITEM (LEDGER)                                                     */
  /* ---------------------------------------------------------------------- */

  const openItem = (item: any) => {
    const exists = openTabs.some((t) => t.id === item.id);

    if (!exists) {
      setOpenTabs((prev) => [...prev, item]);
    }

    setActiveTab(item.id);
    setTopTab("Editor");
  };

  /* ---------------------------------------------------------------------- */
  /* CLOSE TAB                                                              */
  /* ---------------------------------------------------------------------- */

  const closeTab = (id: string) => {
    const remaining = openTabs.filter((t) => t.id !== id);
    setOpenTabs(remaining);

    if (activeTab === id) {
      const newActive = remaining.length
        ? remaining[remaining.length - 1].id
        : null;

      setActiveTab(newActive);

      if (!newActive) {
        setTopTab("Overview");
      }
    }
  };

  /* ---------------------------------------------------------------------- */
  /* MAIN CONTENT SWITCH                                                    */
  /* ---------------------------------------------------------------------- */

  const renderContent = () => {
    switch (topTab) {
      case "Overview":
        return <WorkspaceOverview activeLedger={activeLedger} />;

      case "Editor":
        return (
          <WorkspaceEditor
            activeTab={activeTab}
            openTabs={openTabs}
          />
        );

      case "Routes":
        return <RouteManager activeLedger={activeLedger} />;

      case "Permissions":
        return <WorkspaceProjectPerms activeLedger={activeLedger} />;

      default:
        return null;
    }
  };

  /* ---------------------------------------------------------------------- */
  /* LAYOUT                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="flex h-full w-full overflow-hidden bg-[--surface-1] text-[--text-1]">

      {/* LEFT SIDEBAR */}
      <ProjectSidebar
        selectedProgramId={selectedProgramId}
        ledgers={ledgers}
        openItem={openItem}
      />

      {/* MAIN COLUMN */}
      <main className="flex flex-col flex-1 overflow-hidden bg-[--surface-0]">

        {/* TOP MENU */}
        <WorkspaceMenu
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />

        {/* TOP TABS */}
        <div className="flex border-b border-[--border-2] bg-[--surface-0] px-2">
          {TOP_TABS.map((tab) => {
            const selected = topTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setTopTab(tab)}
                className={`
                  px-8 py-3 text-sm rounded-t-lg transition-all whitespace-nowrap
                  border-r border-[--border-2]
                  ${
                    selected
                      ? "bg-[--surface-2] font-semibold text-[--text-1]"
                      : "hover:bg-[--surface-1] text-[--text-2]"
                  }
                `}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-auto min-h-0">
          {renderContent()}
        </div>

        {/* BOTTOM TABS */}
        <div className="flex items-center gap-2 border-t border-[--border-2] bg-[--surface-0] px-3 py-2 shadow-[0_-4px_14px_-6px_rgba(0,0,0,0.07)]">

          <div className="flex-1 flex items-center gap-1 overflow-x-auto whitespace-nowrap">
            {openTabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setTopTab("Editor");
                  }}
                  className={`
                    group flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all select-none
                    ${
                      isActive
                        ? "bg-[color-mix(in_oklab,var(--accent),transparent 86%)] border-[--accent] text-[--accent]"
                        : "bg-[--surface-1] border-[--border-2] hover:bg-[--surface-2]"
                    }
                  `}
                >
                  <FileSpreadsheet className="h-4 w-4 opacity-60" />
                  <span className="text-sm">{tab.name}</span>

                  <X
                    className="h-3.5 w-3.5 opacity-40 hover:opacity-80 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* MENU BUTTON */}
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-lg border border-[--border-2] bg-[--surface-0] hover:bg-[--surface-1] transition"
          >
            <MoreVertical className="h-5 w-5 opacity-70" />
          </button>
        </div>
      </main>
    </div>
  );
}
