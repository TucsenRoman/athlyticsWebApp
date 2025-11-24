import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";

import ProtectedRoute from "@/components/ProtectedRoute";
import HeaderLayout from "@/components/header/HeaderLayout";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import LedgerPage from "./pages/LedgerPage";
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

              {/* AUTH ROUTES NOW SPLIT -------------------------------------- */}
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />

              {/* PROTECTED ROUTES ------------------------------------------- */}
              <Route
                path="/fieldview"
                element={
                  <ProtectedRoute>
                    <HeaderLayout>
                      <FieldViewScreen />
                    </HeaderLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ledger"
                element={
                  <ProtectedRoute>
                    <HeaderLayout>
                      <LedgerPage />
                    </HeaderLayout>
                  </ProtectedRoute>
                }
              />

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

              {/* CATCH-ALL -------------------------------------------------- */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </BrowserRouter>

        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
