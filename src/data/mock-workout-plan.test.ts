import { afterEach, describe, expect, it, vi } from "vitest";

// The plan computes its dates when the module loads, so each case re-imports it
// after faking the clock.
async function planForDay(isoDate: string) {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(`${isoDate}T10:00:00`));
	vi.resetModules();
	const { mockWorkoutPlanData } = await import("./mock-workout-plan");
	return mockWorkoutPlanData;
}

describe("mock workout plan dates", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("starts on the Monday of the current week on a Sunday", async () => {
		const plan = await planForDay("2025-07-20"); // Sunday
		expect(plan[0].date).toBe("2025-07-14");
	});

	it("starts on the Monday of the current week midweek", async () => {
		const plan = await planForDay("2025-07-16"); // Wednesday
		expect(plan[0].date).toBe("2025-07-14");
	});
});
