import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

import HeaderLayout from "@/components/header/HeaderLayout";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import LedgerPage from "./pages/LedgerPage";
import LedgerView from "./components/ledger/LedgerView";
import FieldViewScreen from "./components/fieldview/FieldViewScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />

            {/* FieldView (main app hub) */}
            <Route
              path="/fieldview"
              element={
                <HeaderLayout>
                  <FieldViewScreen />
                </HeaderLayout>
              }
            />

            {/* Alias: /app → /fieldview */}
            <Route path="/app" element={<Navigate to="/fieldview" replace />} />

            {/* Ledger */}
            <Route
              path="/ledger"
              element={
                <HeaderLayout>
                  <LedgerPage />
                </HeaderLayout>
              }
            />

            <Route
              path="/ledgers/:ledgerId"
              element={
                <HeaderLayout>
                  <LedgerView />
                </HeaderLayout>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
