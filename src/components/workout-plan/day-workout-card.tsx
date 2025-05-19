"use client";

import type React from "react";

import { format } from "date-fns";
import { ZapOff, CheckCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { WorkoutDay, Exercise } from "@/types/workout-plan";

interface DayWorkoutCardProps {
  date: Date;
  workout?: WorkoutDay;
  isToday: boolean;
  onExerciseClick: (exercise: Exercise) => void;
}

export default function DayWorkoutCard({
  date,
  workout,
  isToday,
  onExerciseClick,
}: DayWorkoutCardProps) {
  const dayName = format(date, "EEEE");
  const dayDate = format(date, "MMM d");

  const handleExerciseInfoClick = (e: React.MouseEvent, exercise: Exercise) => {
    e.stopPropagation();
    onExerciseClick(exercise);
  };

  const handleToggleExerciseCompletion = (exerciseId: string) => {
    // In a real app, this would update the exercise completion status
    console.log(`Toggle completion for exercise: ${exerciseId}`);
  };

  const handleMarkDayComplete = () => {
    // In a real app, this would mark all exercises for the day as complete
    console.log(`Mark day complete: ${format(date, "yyyy-MM-dd")}`);
  };

  return (
    <Card
      className={cn(
        "h-full flex flex-col",
        isToday && "border-primary shadow-md"
      )}
    >
      <CardHeader className={cn("pb-2", isToday && "bg-primary/5")}>
        <CardTitle className="flex justify-between items-center">
          <div>
            <div className="text-lg">{dayName}</div>
            <div className="text-sm text-muted-foreground">{dayDate}</div>
          </div>
          {isToday && (
            <div className="bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded-full">
              Today
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        {workout ? (
          <div className="space-y-4">
            {workout.title && (
              <h3 className="font-medium text-lg">{workout.title}</h3>
            )}

            <ul className="space-y-4">
              {workout.exercises.map((exercise) => (
                <li
                  key={exercise.id}
                  className="border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id={`exercise-${exercise.id}`}
                      checked={exercise.isCompleted}
                      onCheckedChange={() =>
                        handleToggleExerciseCompletion(exercise.id)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={`exercise-${exercise.id}`}
                          className={cn(
                            "font-medium cursor-pointer",
                            exercise.isCompleted &&
                              "line-through text-muted-foreground"
                          )}
                        >
                          {exercise.name}
                        </label>
                        {exercise.hasDetails && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) =>
                              handleExerciseInfoClick(e, exercise)
                            }
                          >
                            <Info className="h-4 w-4" />
                            <span className="sr-only">Exercise details</span>
                          </Button>
                        )}
                      </div>
                      <div className="text-sm mt-1">
                        {exercise.prescription}
                      </div>
                      {exercise.rest && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Rest: {exercise.rest}
                        </div>
                      )}
                      {exercise.notes && (
                        <div className="text-sm italic mt-1">
                          {exercise.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={handleMarkDayComplete}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Day as Complete
            </Button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <ZapOff className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-medium">Rest Day</p>
            <p className="text-sm text-muted-foreground mt-1">
              No workout scheduled for today
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
