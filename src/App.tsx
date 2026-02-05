// src/App.tsx
"use client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TooltipProvider } from "@/components/ui/overlays/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemoProvider } from "@/contexts/DemoContext";
import { UserSettingsProvider } from "@/features/user-scope/UserSettingsContext";
import { ProgramProvider } from "@/features/program-cloak/useProgramContext";
import { PushPanelProvider, usePushPanel } from "@/contexts/PushPanelContext";

import RequireAuth from "@/components/navigation/RequireAuth";
import RequireProgram from "@/features/program-cloak/RequireProgram";

import PageShell from "@/components/layout/PageShell";
import { PushPanel } from "@/components/ui";

import BatonChatInterface from "@/components/baton/BatonChatInterface";
import { BotMessageSquare } from "lucide-react";

import { ProfileProvider } from "@/features/profile/ProfileProvider";

// PAGES
import LandingPage from "@/pages/LandingPage";
import Auth from "@/pages/auth/AuthPage";
import RadarPage from "@/pages/RadarPage";
import WorkspacePage from "@/pages/WorkspacePage";
// import DiscoveryPage from "@/pages/DiscoveryPage";
import NotFound from "@/pages/NotFound";

// SETTINGS PAGES
import SettingsLayout from "@/pages/settings/SettingsLayout";
import ProfileSettingsPage from "@/pages/settings/ProfileSettingsPage";
import AppearanceSettingsPage from "@/pages/settings/AppearanceSettingsPage";
import NotificationSettingsPage from "@/pages/settings/NotificationSettingsPage";
import SecuritySettingsPage from "@/pages/settings/security/SecuritySettingsPage";
import StorageSettingsPage from "@/pages/settings/StorageSettingsPage";
import ExperimentsSettingsPage from "@/pages/settings/ExperimentsSettingsPage";
import BillingSettingsPage from "@/pages/settings/BillingSettingsPage";
import SupportSettingsPage from "@/pages/settings/SupportSettingsPage";
import AIAssistantSettingsPage from "@/pages/settings/AIAssistantSettingsPage";

// PREVIEW PAGES
import TrainingPreviewPage from "./pages/public/TrainingPreview";
import DiscoveryPreviewPage from "./pages/public/DiscoveryPreview";
import PricingPage from "./pages/public/PricingPage";
import MobileNav from "./components/navigation/TabBar";
import PasswordResetPage from "./pages/auth/PasswordResetPage";
import MarketingPageShell from "./components/layout/MarketingPageShell";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProfileProvider>
          <UserSettingsProvider>
            <ProgramProvider>
              <TooltipProvider>
                <PushPanelProvider>
                  <BrowserRouter>
                    <DemoProvider>
                      <RouterContent />
                    </DemoProvider>
                  </BrowserRouter>
                </PushPanelProvider>
              </TooltipProvider>
            </ProgramProvider>
          </UserSettingsProvider>
        </ProfileProvider>
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
    <Routes>
      {/* PUBLIC */}
      <Route
        path="/"
        element={
          <MarketingPageShell>
            <LandingPage />
          </MarketingPageShell>
        }
      />
      <Route
        path="/auth"
        element={
          <MarketingPageShell>
            <Auth />
          </MarketingPageShell>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PageShell>
            <PasswordResetPage />
          </PageShell>
        }
      />


      {/* PROGRAM-SCOPED */}
      <Route
        path="/program/radar"
        element={
          <PageShell>
            <RequireProgram>
              <RadarPage />
            </RequireProgram>
          </PageShell>
        }
      />

      {/* WORKSPACE ROUTES */}
      <Route
        path="/program/workspace/*"
        element={
          <PageShell>
            <RequireProgram>
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
            </RequireProgram>
          </PageShell>
        }
      />

      <Route
        path="/program/manager/*"
        element={
          <PageShell>
            <RequireProgram>
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
            </RequireProgram>
          </PageShell>
        }
      />

      <Route
        path="/program/editor/*"
        element={
          <PageShell>
            <RequireProgram>
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
            </RequireProgram>
          </PageShell>
        }
      />

      <Route
        path="/program/editor/:fileId"
        element={
          <PageShell>
            <RequireProgram>
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
            </RequireProgram>
          </PageShell>
        }
      />

      <Route
        path="/program/analyzer/*"
        element={
          <PageShell>
            <RequireProgram>
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
            </RequireProgram>
          </PageShell>
        }
      />

      <Route
        path="/program/calendar/*"
        element={
          <PageShell>
            <RequireProgram>
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
            </RequireProgram>
          </PageShell>
        }
      />

      {/* PREVIEW */}
      <Route
        path="/preview/training"
        element={
          <PageShell>
            <TrainingPreviewPage />
          </PageShell>
        }
      />

      <Route
        path="/preview/discovery"
        element={
          <PageShell>
            <DiscoveryPreviewPage />
          </PageShell>
        }
      />

      {/* PRICING */}
      <Route
        path="/pricing"
        element={
          <PageShell>
            <PricingPage />
          </PageShell>
        }
      />

      {/* SETTINGS */}
      <Route
        path="/settings"
        element={
          <PageShell>
            <RequireAuth>
              <SettingsLayout />
            </RequireAuth>
          </PageShell>
        }
      >
        {/* ~Map over these. */}
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
  );
}
