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
              {/* PUBLIC ROUTES ------------------------------------------------ */}
              <Route path="/" element={<Home />} />

              {/* AUTH ROUTES -------------------------------------------------- */}
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />

              {/* PROTECTED ROUTES ------------------------------------------- */}
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

              {/* For now, Study shares the same page as Discovery */}
              <Route
                path="/workspace"
                element={
                  <ProtectedRoute>
                    <HeaderLayout>
                      Sup
                    </HeaderLayout>
                  </ProtectedRoute>
                }
              />

              {/* Ledger detail (Study detail view) -------------------------- */}
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

              {/* LEGACY ROUTE REDIRECTS ------------------------------------- */}
              <Route
                path="/field"
                element={<Navigate to="/field" replace />}
              />
              <Route
                path="/ledger"
                element={<Navigate to="/discovery" replace />}
              />

              {/* CATCH-ALL -------------------------------------------------- */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
