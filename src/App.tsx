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

import ProtectedRoute from "@/components/ProtectedRoute";
import HeaderLayout from "@/components/navigation/HeaderLayout";

import Home from "./pages/HomePage";
import Auth from "./pages/Auth";
import DiscoveryPage from "./pages/DiscoveryPage";
import WorkspacePage from "./pages/WorkspacePage";
import LedgerView from "./components/ledger/LedgerView";
import FieldViewScreen from "./components/fieldview/FieldViewScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>

              {/* PUBLIC -------------------------------------------------------- */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />

              {/* PROTECTED ----------------------------------------------------- */}

              {/* FIELD */}
              <Route
                path="/field"
                element={
                  <ProtectedRoute>
                    <HeaderLayout>
                      <FieldViewScreen />
                    </HeaderLayout>
                  </ProtectedRoute>
                }
              />

              {/* DISCOVERY */}
              <Route
                path="/discovery"
                element={
                  <ProtectedRoute>
                    <HeaderLayout>
                      <DiscoveryPage />
                    </HeaderLayout>
                  </ProtectedRoute>
                }
              />

              {/* WORKSPACE (NEW) */}
              <Route
                path="/workspace"
                element={
                  <ProtectedRoute>
                    <HeaderLayout>
                      <WorkspacePage />
                    </HeaderLayout>
                  </ProtectedRoute>
                }
              />

              {/* LEDGER DETAIL */}
              <Route
                path="/ledgers/:ledgerId"
                element={
                  <ProtectedRoute>
                    <HeaderLayout>
                      <LedgerView />
                    </HeaderLayout>
                  </ProtectedRoute>
                }
              />

              {/* LEGACY REDIRECTS --------------------------------------------- */}
              <Route
                path="/ledger"
                element={<Navigate to="/discovery" replace />}
              />

              {/* CATCH-ALL ----------------------------------------------------- */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
