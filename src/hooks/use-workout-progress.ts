"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
import type { Exercise, WorkoutDay } from "@/types/workout-plan";

type Progress = Record<string, boolean>;

const storageKey = (userId: string) =>
	`livevitals_workout_progress:${userId}`;

const EMPTY: Progress = {};

export interface UseWorkoutProgressReturn {
	isCompleted: (exercise: Exercise) => boolean;
	toggleExercise: (exerciseId: string) => void;
	completeDay: (exerciseIds: string[]) => void;
}

const useWorkoutProgress = (
	plan: WorkoutDay[],
): UseWorkoutProgressReturn => {
	const { user } = useAuth();
	const userId = user?.id;
	const [progress, setProgress] = useState<Progress>(EMPTY);
	// Set once this user's stored overrides were loaded; write only after it
	const [loadedId, setLoadedId] = useState<string | null>(null);

	const seed = useMemo(() => {
		const seeded: Progress = {};
		for (const day of plan) {
			for (const exercise of day.exercises) {
				seeded[exercise.id] = exercise.isCompleted;
			}
		}
		return seeded;
	}, [plan]);

	// Load via microtask after mount: SSR markup and first client render stay
	// identical, and reads are idempotent so the seed never overwrites storage
	useEffect(() => {
		queueMicrotask(() => {
			if (!userId) return;
			try {
				const stored = JSON.parse(
					localStorage.getItem(storageKey(userId)) ?? "{}",
				) as Progress;
				setProgress(stored);
			} catch {
				setProgress(EMPTY);
			}
			setLoadedId(userId);
		});
	}, [userId]);

	const persist = useCallback(
		(next: Progress) => {
			if (loadedId === userId && userId) {
				localStorage.setItem(
					storageKey(userId),
					JSON.stringify(next),
				);
			}
		},
		[loadedId, userId],
	);

	const isCompleted = useCallback(
		(exercise: Exercise) =>
			exercise.id in progress ? progress[exercise.id] : seed[exercise.id],
		[progress, seed],
	);

	const toggleExercise = useCallback(
		(exerciseId: string) => {
			const current =
				exerciseId in progress
					? progress[exerciseId]
					: (seed[exerciseId] ?? false);
			const next = { ...progress, [exerciseId]: !current };
			setProgress(next);
			persist(next);
		},
		[progress, seed, persist],
	);

	const completeDay = useCallback(
		(exerciseIds: string[]) => {
			const next = { ...progress };
			for (const exerciseId of exerciseIds) next[exerciseId] = true;
			setProgress(next);
			persist(next);
		},
		[progress, persist],
	);

	return { isCompleted, toggleExercise, completeDay };
};

export default useWorkoutProgress;
