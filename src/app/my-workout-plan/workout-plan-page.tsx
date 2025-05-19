"use client";

import { useState } from "react";
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageWrapper from "@/components/PageWrapper";
import ProtectedRoute from "@/components/ProtectedRoute";
import DayWorkoutCard from "@/components/workout-plan/day-workout-card";
import ExerciseDetailsModal from "@/components/workout-plan/exercise-details-modal";
import { mockWorkoutPlanData } from "@/data/mock-workout-plan";
import type { Exercise } from "@/types/workout-plan";

export default function WorkoutPlanPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date();
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  const formattedDateRange = `${format(currentWeekStart, "MMM d")} - ${format(
    weekEnd,
    "MMM d, yyyy"
  )}`;

  const handlePreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handleTodayClick = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Generate array of 7 days starting from currentWeekStart
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });

  return (
    <ProtectedRoute>
      <PageWrapper>
        <div className="container mx-auto p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6">My Weekly Workout Plan</h1>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousWeek}
                  aria-label="Previous Week"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium">
                  {formattedDateRange}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextWeek}
                  aria-label="Next Week"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={handleTodayClick}
                className="flex items-center gap-2"
              >
                <CalendarDays className="h-4 w-4" />
                <span>Today</span>
              </Button>
            </div>

            {/* Check if there's any workout for the week */}
            {!mockWorkoutPlanData.some((day) =>
              weekDays.some((date) => format(date, "yyyy-MM-dd") === day.date)
            ) && (
              <Card className="p-8 text-center">
                <p className="text-lg text-muted-foreground">
                  No workout plan has been assigned for this week. Please
                  contact your instructor if you believe this is an error.
                </p>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
              {weekDays.map((date) => {
                const formattedDate = format(date, "yyyy-MM-dd");
                const dayWorkout = mockWorkoutPlanData.find(
                  (day) => day.date === formattedDate
                );
                const isToday = isSameDay(date, today);

                return (
                  <DayWorkoutCard
                    key={formattedDate}
                    date={date}
                    workout={dayWorkout}
                    isToday={isToday}
                    onExerciseClick={handleExerciseClick}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {selectedExercise && (
          <ExerciseDetailsModal
            exercise={selectedExercise}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </PageWrapper>
    </ProtectedRoute>
  );
}
