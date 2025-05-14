import type { Metadata } from "next"
import DietSelectionClientPage from "./DietSelectionClientPage"

export const metadata: Metadata = {
  title: "Diet Selection | HealthTrack",
  description: "Choose a diet plan that fits your lifestyle",
}

export default function DietSelection() {
  return <DietSelectionClientPage />
}
