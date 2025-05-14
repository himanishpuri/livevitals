"use client";

import DashboardPage from "@/components/dashboard/dashboard-page";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardClientPage() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
