// src/App.tsx
"use client";

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TooltipProvider } from "@/components/ui/overlays/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserSettingsProvider } from "@/features/user-settings/UserSettingsContext";
import { ProgramProvider } from "@/features/program-cloak/useProgramContext";
import { PushPanelProvider, usePushPanel } from "@/contexts/PushPanelContext";

import ProtectedRoute from "@/components/navigation/ProtectedRoute";
import RequireProgram from "@/features/program-cloak/RequireProgram";
import PageShell from "@/components/layout/PageShell";
import { PushPanel } from "@/components/ui";

import BatonChatInterface from "@/components/baton/BatonChatInterface";
import { BotMessageSquare } from "lucide-react";
import MainHeader from "@/components/navigation/MainHeader";

// Pages
import Home from "@/pages/HomePage";
import Auth from "@/pages/Auth";
import FieldPage from "@/pages/FieldPage";
import WorkspacePage from "@/pages/WorkspacePage";
import DiscoveryPage from "@/pages/DiscoveryPage";
import SettingsLayout from "@/pages/settings/SettingsLayout";
import NotFound from "@/pages/NotFound";

// Settings sub-pages
import ProfileSettingsPage from "@/pages/settings/profile/ProfileSettingsPage";
import AppearanceSettingsPage from "@/pages/settings/appearance/AppearanceSettingsPage";
import NotificationSettingsPage from "@/pages/settings/notifications/NotificationSettingsPage";
import SecuritySettingsPage from "@/pages/settings/security/SecuritySettingsPage";
import StorageSettingsPage from "@/pages/settings/storage/StorageSettingsPage";
import ExperimentsSettingsPage from "@/pages/settings/experiments/ExperimentsSettingsPage";
import BillingSettingsPage from "@/pages/settings/billing/BillingSettingsPage";
import SupportSettingsPage from "@/pages/settings/support/SupportSettingsPage";
import AIAssistantSettingsPage from "@/pages/settings/AIAssistantSettingsPage";

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
                  {/* Persistent header */}
                  <MainHeader />

                  {/* Route-based content */}
                  <RouterContent />
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
    <div className="h-[100vh] max-h-screen flex flex-col overflow-hidden">
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />

        {/* RADAR */}
        <Route
          path="/radar"
          element={
            <ProtectedRoute>
              <PageShell>
                <FieldPage />
              </PageShell>
            </ProtectedRoute>
          }
        />

        {/* WORKSPACE */}
        <Route
          path="/workspace"
          element={
            <ProtectedRoute>
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
            </ProtectedRoute>
          }
        />

        {/* DISCOVERY */}
        <Route
          path="/discovery"
          element={
            <ProtectedRoute>
              <PageShell>
                <DiscoveryPage />
              </PageShell>
            </ProtectedRoute>
          }
        />

        {/* SETTINGS */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <PageShell>
                <SettingsLayout />
              </PageShell>
            </ProtectedRoute>
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

        {/* FALLBACK */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </div>
  );
}
