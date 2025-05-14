import type { Metadata } from "next";
import ProfileClientPage from "./profile-page";

export const metadata: Metadata = {
  title: "Profile | HealthTrack",
  description: "View and edit your profile",
};

export default function Profile() {
  return <ProfileClientPage />;
}
