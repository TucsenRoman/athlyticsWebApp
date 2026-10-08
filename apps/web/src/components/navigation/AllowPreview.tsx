"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function AllowPreview({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Guests allowed
  return <>{children}</>;
}
