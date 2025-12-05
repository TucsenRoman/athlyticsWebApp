// src/App.tsx
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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

// RequireProgram wrapper
import RequireProgram from "@/components/navigation/RequireProgram";

// Pages
import Home from "./pages/HomePage";
import Auth from "./pages/Auth";
import DiscoveryPage from "./pages/DiscoveryPage";
import WorkspacePage from "./pages/WorkspacePage";
import LedgerView from "./components/ledger/LedgerView";
import FieldPage from "./pages/FieldPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <div className="h-[100vh] max-h-screen overflow-auto">

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
                <Route
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
                />

                {/* LEGACY REDIRECTS */}
                <Route path="/ledger" element={<Navigate to="/discovery" replace />} />

                {/* CATCH-ALL */}
                <Route path="*" element={<NotFound />} />

              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
