import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Exercise } from "@/types/workout-plan";

interface ExerciseDetailsModalProps {
  exercise: Exercise;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExerciseDetailsModal({
  exercise,
  isOpen,
  onClose,
}: ExerciseDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{exercise.name}</DialogTitle>
          {exercise.muscleGroups && (
            <DialogDescription>
              <div className="flex flex-wrap gap-1 mt-2">
                {exercise.muscleGroups.map((muscle) => (
                  <Badge key={muscle} variant="secondary">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
            {exercise.videoUrl ? (
              <div className="w-full h-full">
                {/* In a real app, this would be a video player */}
                <div className="w-full h-full flex items-center justify-center">
                  Video Placeholder
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">
                Exercise demonstration video not available
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Instructions</h3>
            <div className="text-sm space-y-2">
              {exercise.instructions ? (
                <div>
                  {exercise.instructions.map((instruction, index) => (
                    <p key={index} className="mb-2">
                      {instruction}
                    </p>
                  ))}
                </div>
              ) : (
                <p>
                  Start by positioning yourself correctly. Maintain proper form
                  throughout the movement. Focus on controlled motion and proper
                  breathing. Ensure you complete the full range of motion.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Prescription</h3>
              <p className="text-sm">{exercise.prescription}</p>
            </div>

            {exercise.rest && (
              <div>
                <h3 className="text-sm font-medium mb-1">Rest Period</h3>
                <p className="text-sm">{exercise.rest}</p>
              </div>
            )}
          </div>

          {exercise.notes && (
            <div>
              <h3 className="text-sm font-medium mb-1">Coach's Notes</h3>
              <p className="text-sm italic">{exercise.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
