import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useWorkoutProgress from "./use-workout-progress";
import type { Exercise, WorkoutDay } from "@/types/workout-plan";

const { userRef } = vi.hoisted(() => ({
	userRef: { current: undefined as { id: string } | undefined },
}));

vi.mock("@/context/auth-context", () => ({
	useAuth: () => ({ user: userRef.current }),
}));

const plan: WorkoutDay[] = [
	{
		date: "2026-11-16",
		exercises: [
			{
				id: "ex1",
				name: "Bench Press",
				prescription: "4 x 8",
				hasDetails: false,
				isCompleted: true,
			},
			{
				id: "ex2",
				name: "Row",
				prescription: "4 x 10",
				hasDetails: false,
				isCompleted: false,
			},
		],
	},
];

const exercise = (id: string, isCompleted: boolean): Exercise => ({
	id,
	name: id,
	prescription: "",
	hasDetails: false,
	isCompleted,
});

const keyOf = (userId: string) => `livevitals_workout_progress:${userId}`;

const stored = (userId: string) =>
	JSON.parse(localStorage.getItem(keyOf(userId)) ?? "null");

// Flush the hook's post-mount microtask hydration
const hydrate = () => act(async () => {});

beforeEach(() => {
	localStorage.clear();
	userRef.current = { id: "user-1" };
});

describe("useWorkoutProgress", () => {
	it("toggles an exercise and persists it", async () => {
		const { result } = renderHook(() => useWorkoutProgress(plan));
		await hydrate();

		expect(result.current.isCompleted(exercise("ex2", false))).toBe(false);

		act(() => result.current.toggleExercise("ex2"));

		expect(result.current.isCompleted(exercise("ex2", false))).toBe(true);
		expect(stored("user-1").ex2).toBe(true);

		act(() => result.current.toggleExercise("ex2"));

		expect(stored("user-1").ex2).toBe(false);
	});

	it("completeDay marks every exercise of the day", async () => {
		const { result } = renderHook(() => useWorkoutProgress(plan));
		await hydrate();

		act(() => result.current.completeDay(["ex1", "ex2"]));

		expect(result.current.isCompleted(exercise("ex1", false))).toBe(true);
		expect(result.current.isCompleted(exercise("ex2", false))).toBe(true);
		expect(stored("user-1")).toEqual({ ex1: true, ex2: true });
	});

	it("restores stored progress on remount", async () => {
		const first = renderHook(() => useWorkoutProgress(plan));
		await hydrate();
		act(() => first.result.current.toggleExercise("ex2"));
		first.unmount();

		const second = renderHook(() => useWorkoutProgress(plan));
		await hydrate();

		expect(second.result.current.isCompleted(exercise("ex2", false))).toBe(
			true,
		);
	});

	it("does not overwrite stored progress with the seed on mount", async () => {
		localStorage.setItem(keyOf("user-1"), JSON.stringify({ ex1: false }));

		const { result } = renderHook(() => useWorkoutProgress(plan));
		await hydrate();

		expect(result.current.isCompleted(exercise("ex1", true))).toBe(false);
		expect(stored("user-1")).toEqual({ ex1: false });
	});

	it("keeps progress of two users separate", async () => {
		const { result, rerender } = renderHook(() =>
			useWorkoutProgress(plan),
		);
		await hydrate();
		act(() => result.current.toggleExercise("ex2"));

		userRef.current = { id: "instructor-1" };
		rerender();
		await hydrate();

		await waitFor(() =>
			expect(
				result.current.isCompleted(exercise("ex2", false)),
			).toBe(false),
		);
		expect(localStorage.getItem(keyOf("instructor-1"))).toBeNull();
		expect(stored("user-1").ex2).toBe(true);
	});
});
