import type { Metadata } from "next";
import WorkoutPlanPage from "./workout-plan-page";

export const metadata: Metadata = {
  title: "My Workout Plan | LiveVitals",
  description: "View and track your weekly workout plan",
};

export default function MyWorkoutPlan() {
  return <WorkoutPlanPage />;
}
