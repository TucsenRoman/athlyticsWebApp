"use client";

import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  // Wait for auth state to resolve
  if (loading) return null;

  // Block unauthenticated users
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
