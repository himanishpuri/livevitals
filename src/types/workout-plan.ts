export interface Exercise {
  id: string;
  name: string;
  prescription: string;
  rest?: string;
  notes?: string;
  hasDetails: boolean;
  isCompleted: boolean;
  muscleGroups?: string[];
  instructions?: string[];
  videoUrl?: string;
}

export interface WorkoutDay {
  date: string; // Format: 'YYYY-MM-DD'
  title?: string;
  exercises: Exercise[];
}
