// src/App.tsx
"use client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TooltipProvider } from "@/components/ui/overlays/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemoProvider } from "@/contexts/DemoContext";
import { UserSettingsProvider } from "@/features/user-settings/UserSettingsContext";
import { ProgramProvider } from "@/features/program-cloak/useProgramContext";
import { PushPanelProvider, usePushPanel } from "@/contexts/PushPanelContext";

import RequireAuth from "@/components/navigation/RequireAuth";
import RequireProgram from "@/features/program-cloak/RequireProgram";

import PageShell from "@/components/layout/PageShell";
import { PushPanel } from "@/components/ui";

import BatonChatInterface from "@/components/baton/BatonChatInterface";
import { BotMessageSquare } from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";

// PAGES
import LandingPage from "@/pages/LandingPage";
import Auth from "@/pages/Auth";
import FieldPage from "@/pages/FieldPage";
import WorkspacePage from "@/pages/WorkspacePage";
// import DiscoveryPage from "@/pages/DiscoveryPage";
import NotFound from "@/pages/NotFound";

// SETTINGS PAGES
import SettingsLayout from "@/pages/settings/SettingsLayout";
import ProfileSettingsPage from "@/pages/settings/profile/ProfileSettingsPage";
import AppearanceSettingsPage from "@/pages/settings/appearance/AppearanceSettingsPage";
import NotificationSettingsPage from "@/pages/settings/notifications/NotificationSettingsPage";
import SecuritySettingsPage from "@/pages/settings/security/SecuritySettingsPage";
import StorageSettingsPage from "@/pages/settings/storage/StorageSettingsPage";
import ExperimentsSettingsPage from "@/pages/settings/experiments/ExperimentsSettingsPage";
import BillingSettingsPage from "@/pages/settings/billing/BillingSettingsPage";
import SupportSettingsPage from "@/pages/settings/support/SupportSettingsPage";
import AIAssistantSettingsPage from "@/pages/settings/AIAssistantSettingsPage";

// PREVIEW PAGES
import TrainingPreviewPage from "./pages/previews/TrainingPreview";
import DiscoveryPreviewPage from "./pages/previews/DiscoveryPreview";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserSettingsProvider>
          <ProgramProvider>
            <TooltipProvider>
              <PushPanelProvider>
                <BrowserRouter>
                  <DemoProvider>
                    <AppHeader />
                    <RouterContent />
                  </DemoProvider>
                </BrowserRouter>
              </PushPanelProvider>
            </TooltipProvider>
          </ProgramProvider>
        </UserSettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

/* ========================================================================== */
/* ROUTER CONTENT                                                             */
/* ========================================================================== */

function RouterContent() {
  const { open, setOpen } = usePushPanel();

  return (
    // <div className="h-[100vh] max-h-screen flex flex-col overflow-hidden">
    <div className="flex flex-col">
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        
        {/* PROGRAM-SCOPED (DEMO OR AUTH) */}
        <Route
          path="/radar"
          element={
            <RequireProgram>
              <PageShell>
                <FieldPage />
              </PageShell>
            </RequireProgram>
          }
        />

        <Route
          path="/workspace"
          element={
            <RequireProgram>
              <PageShell>
                <PushPanel
                  open={open}
                  width="360px"
                  title="Baton"
                  titleIcon={<BotMessageSquare className="h-4 w-4" />}
                  onClose={() => setOpen(false)}
                  panel={<BatonChatInterface />}
                >
                  <WorkspacePage />
                </PushPanel>
              </PageShell>
            </RequireProgram>
          }
        />

        {/* TRAINING (PREVIEW) */}
        <Route
          path="/preview/training"
          element={
            <PageShell>
              <TrainingPreviewPage />
            </PageShell>
          }
        />

        {/* DISCOVERY (PREVIEW) */}
        <Route
          path="/preview/discovery"
          element={
            <PageShell>
              <DiscoveryPreviewPage />
            </PageShell>
          }
        />

        {/* ------------------------------------------------------------------ */}
        {/* SETTINGS (AUTH ONLY)                                               */}
        {/* ------------------------------------------------------------------ */}

        <Route
          path="/settings"
          element={
            <RequireAuth>
              <PageShell>
                <SettingsLayout />
              </PageShell>
            </RequireAuth>
          }
        >
          <Route index element={<ProfileSettingsPage />} />
          <Route path="profile" element={<ProfileSettingsPage />} />
          <Route path="appearance" element={<AppearanceSettingsPage />} />
          <Route path="notifications" element={<NotificationSettingsPage />} />
          <Route path="security" element={<SecuritySettingsPage />} />
          <Route path="storage" element={<StorageSettingsPage />} />
          <Route path="experiments" element={<ExperimentsSettingsPage />} />
          <Route path="billing" element={<BillingSettingsPage />} />
          <Route path="support" element={<SupportSettingsPage />} />
          <Route path="aiassistant" element={<AIAssistantSettingsPage />} />
        </Route>

        {/* ------------------------------------------------------------------ */}
        {/* FALLBACK                                                           */}
        {/* ------------------------------------------------------------------ */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
