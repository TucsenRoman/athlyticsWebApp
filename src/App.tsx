// src/App.tsx
import React from "react";
import { TooltipProvider } from "@/components/ui/overlays/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { UserSettingsProvider } from "@/features/user-settings/UserSettingsContext";
import MainHeader from "@/components/navigation/MainHeader";

import RequireProgram from "@/features/program-cloak/RequireProgram";
import { ProgramProvider } from "@/features/program-cloak/useProgramContext";


// Main
import Home from "./pages/HomePage";
import DiscoveryPage from "./pages/DiscoveryPage";
import WorkspacePage from "./pages/WorkspacePage";
import FieldPage from "./pages/FieldPage";
import NotFound from "./pages/NotFound";

// Utility
import Auth from "./pages/Auth";
import RequireAuth from "./components/navigation/RequireAuth";
import ProtectedRoute from "@/components/navigation/ProtectedRoute";

// Settings
import SettingsLayout from "./pages/settings/SettingsLayout";
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

        {/* USER-SCOPED (global, program-agnostic) */}
        <UserSettingsProvider>

          <ProgramProvider> 
            <TooltipProvider>

              <div className="h-[100vh] max-h-screen flex flex-col overflow-hidden">

                <BrowserRouter>
                  <Routes>

                    {/* PUBLIC -------------------------------------------------------- */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Auth />} />
                    <Route path="/signup" element={<Auth />} />

                    {/* PROTECTED ----------------------------------------------------- */}

                    {/* FIELD — needs program */}
                    <Route
                      path="/radar"
                      element={
                        <ProtectedRoute>
                          <MainHeader>
                            <RequireProgram>
                              <FieldPage />
                            </RequireProgram>
                          </MainHeader>
                        </ProtectedRoute>
                      }
                    />

                    {/* WORKSPACE — needs program */}
                    <Route
                      path="/workspace"
                      element={
                        <ProtectedRoute>
                          <MainHeader>
                            <RequireProgram>
                              <WorkspacePage />
                            </RequireProgram>
                          </MainHeader>
                        </ProtectedRoute>
                      }
                    />

                    {/* DISCOVERY — does NOT need program */}
                    <Route
                      path="/discovery"
                      element={
                        <ProtectedRoute>
                          <MainHeader>
                            <DiscoveryPage />
                          </MainHeader>
                        </ProtectedRoute>
                      }
                    />

                    {/* LEDGER DETAIL — needs program */}
                    {/* <Route
                      path="/ledgers/:ledgerId"
                      element={
                        <ProtectedRoute>
                          <MainHeader>
                            <RequireProgram>
                              <LedgerView />
                            </RequireProgram>
                          </MainHeader>
                        </ProtectedRoute>
                      }
                    /> */}

                    {/* USER SETTINGS */}
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <MainHeader>
                            <SettingsLayout />
                          </MainHeader>
                        </ProtectedRoute>
                      }
                    >
                      {/* DEFAULT */}
                      <Route index element={<ProfileSettingsPage />} />

                      {/* PAGES */}
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

                    {/* LEGACY REDIRECTS */}
                    <Route path="/ledger" element={<Navigate to="/discovery" replace />} />

                    {/* CATCH-ALL */}
                    <Route path="*" element={<NotFound />} />

                  </Routes>
                </BrowserRouter>
              </div>
            </TooltipProvider>
          </ProgramProvider>

        </UserSettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
