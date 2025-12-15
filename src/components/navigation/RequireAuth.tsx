"use client";

import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) return null; // or splash / spinner

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
