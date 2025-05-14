"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireInstructor?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireInstructor = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push("/login");
      } else if (requireInstructor && user?.userType !== "instructor") {
        router.push("/dashboard");
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    requireAuth,
    requireInstructor,
    user,
    router,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireInstructor && user?.userType !== "instructor") {
    return null;
  }

  return <>{children}</>;
}
