"use client";

import DataInputPage from "@/components/data-input/data-input-page";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DataInputClientPage() {
  return (
    <ProtectedRoute>
      <DataInputPage />
    </ProtectedRoute>
  );
}
