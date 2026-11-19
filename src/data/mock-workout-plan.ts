import { format, addDays } from "date-fns";
import type { WorkoutDay } from "@/types/workout-plan";

// Get the current date and format it as 'YYYY-MM-DD'
const today = new Date();
const formatDate = (date: Date) => format(date, "yyyy-MM-dd");

// Create dates for the current week
const monday = formatDate(addDays(today, 1 - today.getDay())); // Monday of current week
const tuesday = formatDate(addDays(today, 2 - today.getDay()));
const wednesday = formatDate(addDays(today, 3 - today.getDay()));
const thursday = formatDate(addDays(today, 4 - today.getDay()));
const friday = formatDate(addDays(today, 5 - today.getDay()));
const saturday = formatDate(addDays(today, 6 - today.getDay()));
const sunday = formatDate(addDays(today, 7 - today.getDay()));

export const mockWorkoutPlanData: WorkoutDay[] = [
  {
    date: monday,
    title: "Upper Body Strength",
    exercises: [
      {
        id: "ex1",
        name: "Bench Press",
        prescription: "4 sets x 8-10 reps @ 75% 1RM",
        rest: "90 seconds between sets",
        notes: "Focus on full range of motion and controlled descent",
        hasDetails: true,
        isCompleted: false,
        muscleGroups: ["Chest", "Triceps", "Shoulders"],
        instructions: [
          "Lie on a flat bench with your feet flat on the floor.",
          "Grip the barbell slightly wider than shoulder-width apart.",
          "Unrack the bar and lower it to your mid-chest.",
          "Press the bar back up to full arm extension.",
          "Keep your wrists straight and elbows at about a 45-degree angle from your body.",
        ],
        videoUrl: "/videos/bench-press.mp4",
      },
      {
        id: "ex2",
        name: "Pull-Ups",
        prescription: "3 sets x 8-12 reps",
        rest: "60 seconds between sets",
        notes: "Use assistance band if needed to complete all reps",
        hasDetails: true,
        isCompleted: false,
        muscleGroups: ["Back", "Biceps", "Shoulders"],
        instructions: [
          "Grip the pull-up bar with hands slightly wider than shoulder-width.",
          "Hang with arms fully extended and shoulders engaged.",
          "Pull yourself up until your chin clears the bar.",
          "Lower yourself with control back to the starting position.",
          "Avoid swinging or using momentum to complete the movement.",
        ],
      },
      {
        id: "ex3",
        name: "Shoulder Press",
        prescription: "3 sets x 10-12 reps",
        rest: "60-90 seconds between sets",
        hasDetails: false,
        isCompleted: false,
      },
      {
        id: "ex4",
        name: "Tricep Dips",
        prescription: "3 sets x 12-15 reps",
        hasDetails: false,
        isCompleted: true,
      },
    ],
  },
  {
    date: tuesday,
    title: "Lower Body & Core",
    exercises: [
      {
        id: "ex5",
        name: "Barbell Squats",
        prescription: "4 sets x 6-8 reps @ 80% 1RM",
        rest: "120 seconds between sets",
        notes: "Focus on depth and maintaining a straight back",
        hasDetails: true,
        isCompleted: false,
        muscleGroups: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
        instructions: [
          "Position the barbell on your upper back, not on your neck.",
          "Stand with feet shoulder-width apart, toes slightly pointed out.",
          "Brace your core and maintain a neutral spine throughout the movement.",
          "Bend at the knees and hips to lower your body until thighs are parallel to the ground.",
          "Drive through your heels to return to the starting position.",
        ],
        videoUrl: "/videos/barbell-squat.mp4",
      },
      {
        id: "ex6",
        name: "Romanian Deadlifts",
        prescription: "3 sets x 10 reps",
        rest: "90 seconds between sets",
        hasDetails: false,
        isCompleted: false,
      },
      {
        id: "ex7",
        name: "Plank",
        prescription: "3 sets x 45-60 seconds hold",
        notes: "Keep your body in a straight line from head to heels",
        hasDetails: false,
        isCompleted: false,
      },
    ],
  },
  {
    date: wednesday,
    title: "Cardio & Mobility",
    exercises: [
      {
        id: "ex8",
        name: "Running",
        prescription: "30 minutes at moderate intensity",
        notes: "Target heart rate: 130-150 BPM",
        hasDetails: false,
        isCompleted: false,
      },
      {
        id: "ex9",
        name: "Dynamic Stretching Routine",
        prescription: "Full body routine - 15 minutes",
        hasDetails: true,
        isCompleted: false,
        instructions: [
          "Perform each movement for 30 seconds, focusing on controlled motion.",
          "Arm circles: Small to large circles with both arms.",
          "Leg swings: Forward and lateral for each leg.",
          "Torso twists: Standing with feet shoulder-width apart.",
          "Hip circles: Standing on one leg.",
          "Shoulder rolls: Forward and backward.",
        ],
      },
    ],
  },
  {
    date: thursday,
    title: "Upper Body Hypertrophy",
    exercises: [
      {
        id: "ex10",
        name: "Incline Dumbbell Press",
        prescription: "4 sets x 10-12 reps",
        rest: "60 seconds between sets",
        hasDetails: false,
        isCompleted: false,
      },
      {
        id: "ex11",
        name: "Bent-Over Rows",
        prescription: "4 sets x 10-12 reps",
        rest: "60 seconds between sets",
        hasDetails: false,
        isCompleted: false,
      },
      {
        id: "ex12",
        name: "Lateral Raises",
        prescription: "3 sets x 12-15 reps",
        rest: "45 seconds between sets",
        hasDetails: false,
        isCompleted: false,
      },
      {
        id: "ex13",
        name: "Bicep Curls",
        prescription: "3 sets x 12-15 reps",
        rest: "45 seconds between sets",
        hasDetails: false,
        isCompleted: false,
      },
    ],
  },
  {
    date: friday,
    title: "Lower Body Hypertrophy",
    exercises: [
      {
        id: "ex14",
        name: "Leg Press",
        prescription: "4 sets x 10-12 reps",
        rest: "90 seconds between sets",
        hasDetails: false,
        isCompleted: false,
      },
      {
        id: "ex15",
        name: "Walking Lunges",
        prescription: "3 sets x 20 steps (10 per leg)",
        rest: "60 seconds between sets",
        hasDetails: false,
        isCompleted: false,
      },
      {
        id: "ex16",
        name: "Leg Curls",
        prescription: "3 sets x 12 reps",
        rest: "60 seconds between sets",
        hasDetails: false,
        isCompleted: false,
      },
      {
        id: "ex17",
        name: "Calf Raises",
        prescription: "4 sets x 15-20 reps",
        rest: "45 seconds between sets",
        hasDetails: false,
        isCompleted: false,
      },
    ],
  },
  {
    date: saturday,
    title: "HIIT & Core",
    exercises: [
      {
        id: "ex18",
        name: "HIIT Circuit",
        prescription: "5 rounds of 30 seconds work, 30 seconds rest",
        notes: "Exercises: Burpees, Mountain Climbers, Jump Squats, Push-ups",
        hasDetails: true,
        isCompleted: false,
        instructions: [
          "Perform each exercise at maximum effort for 30 seconds.",
          "Rest for 30 seconds between exercises.",
          "Complete all 4 exercises, then rest for 1 minute before starting the next round.",
          "Focus on maintaining proper form even when fatigued.",
        ],
      },
      {
        id: "ex19",
        name: "Ab Circuit",
        prescription: "3 rounds of 45 seconds work, 15 seconds rest",
        notes: "Exercises: Crunches, Russian Twists, Leg Raises, Plank",
        hasDetails: false,
        isCompleted: false,
      },
    ],
  },
  // Sunday is a rest day, so no entry for sunday
];
