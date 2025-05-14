"use client";

import ProfilePage from "@/components/profile/profile-page";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProfileClientPage() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
