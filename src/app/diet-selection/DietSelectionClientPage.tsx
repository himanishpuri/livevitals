"use client"

import DietSelectionPage from "@/components/diet-selection/diet-selection-page"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function DietSelectionClientPage() {
  return (
    <ProtectedRoute>
      <DietSelectionPage />
    </ProtectedRoute>
  )
}
