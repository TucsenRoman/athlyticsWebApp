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
import ProtectedRoute from "@/components/navigation/ProtectedRoute";
import MainHeader from "@/components/navigation/MainHeader";

import RequireProgram from "@/features/program_cloak/RequireProgram";
import { ProgramProvider } from "@/features/program_cloak/useProgramContext";

// Pages
import Home from "./pages/HomePage";
import Auth from "./pages/Auth";
import DiscoveryPage from "./pages/DiscoveryPage";
import WorkspacePage from "./pages/WorkspacePage";
// import LedgerView from "./features/ledger/LedgerView";
import FieldPage from "./pages/FieldPage";
import TierPage from "./pages/TierPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
                    path="/field"
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

                  {/* DISCOVERY — does NOT need program */}
                  <Route
                    path="/discovery"
                    element={
                      <ProtectedRoute>
                        <MainHeader>
                          <RequireProgram>
                            <DiscoveryPage />
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

                  {/* SETTINGS: TIER MANAGEMENT — does NOT need program */}
                  <Route
                    path="/settings/tier"
                    element={
                      <ProtectedRoute>
                        <MainHeader>
                          <TierPage />
                        </MainHeader>
                      </ProtectedRoute>
                    }
                  />

                  {/* CATCH-ALL */}
                  <Route path="*" element={<NotFound />} />


                  {/* LEGACY REDIRECTS */}
                  <Route path="/ledger" element={<Navigate to="/discovery" replace />} />

                  {/* CATCH-ALL */}
                  <Route path="*" element={<NotFound />} />

                </Routes>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </ProgramProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
