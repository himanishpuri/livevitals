import type { Metadata } from "next";
import DashboardClientPage from "./DashboardClientPage";

export const metadata: Metadata = {
  title: "Dashboard | HealthTrack",
  description: "View your health metrics and progress",
};

export default function Dashboard() {
  return <DashboardClientPage />;
}
