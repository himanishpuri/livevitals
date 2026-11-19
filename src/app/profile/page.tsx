import type { Metadata } from "next";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProfilePage from "@/components/profile/profile-page";

export const metadata: Metadata = {
	title: "Profile | HealthTrack",
	description: "View and edit your profile",
};

export default function Profile() {
	return (
		<ProtectedRoute>
			<ProfilePage />
		</ProtectedRoute>
	);
}
