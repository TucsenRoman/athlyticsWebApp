import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import HeaderLayout from "@/components/header/HeaderLayout";

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
            {/* Public route */}
            <Route path="/auth" element={<Auth />} />

            {/* Authenticated routes all wrapped in HeaderLayout */}
            <Route
              path="/"
              element={
                <HeaderLayout>
                  <FieldViewScreen />
                </HeaderLayout>
              }
            />

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

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
