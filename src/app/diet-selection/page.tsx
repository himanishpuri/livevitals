import type { Metadata } from "next";
import ProtectedRoute from "@/components/protected-route";
import DietSelectionPage from "@/components/diet-selection/diet-selection-page";

export const metadata: Metadata = {
	title: "Diet Selection | HealthTrack",
	description: "Choose a diet plan that fits your lifestyle",
};

export default function DietSelection() {
	return (
		<ProtectedRoute>
			<DietSelectionPage />
		</ProtectedRoute>
	);
}
