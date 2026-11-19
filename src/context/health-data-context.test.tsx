import { act, render, screen, waitFor } from "@testing-library/react";
import { useContext, useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import {
	HealthDataContext,
	HealthDataProvider,
	type HealthDataContextType,
} from "./health-data-context";
import type { HealthData } from "@/types/health-data";
import { initialHealthData } from "@/data/initial-health-data";

const ctxRef: { current?: HealthDataContextType } = {};

function Probe() {
	const ctx = useContext(HealthDataContext);
	useEffect(() => {
		ctxRef.current = ctx;
	});

	return <div>weight:{ctx.healthData.currentWeight}</div>;
}

const ctx = () => ctxRef.current!;

const storedWeight = () =>
	JSON.parse(localStorage.getItem("healthData") ?? "{}").currentWeight;

describe("HealthDataProvider", () => {
	it("persists updateHealthData to localStorage", async () => {
		render(
			<HealthDataProvider>
				<Probe />
			</HealthDataProvider>,
		);

		act(() => ctx().updateHealthData({ currentWeight: 71 }));

		await waitFor(() => expect(storedWeight()).toBe(71));
	});

	it("restores stored data on remount", async () => {
		render(
			<HealthDataProvider>
				<Probe />
			</HealthDataProvider>,
		);
		act(() => ctx().updateHealthData({ currentWeight: 63 }));
		await waitFor(() => expect(storedWeight()).toBe(63));

		render(
			<HealthDataProvider>
				<Probe />
			</HealthDataProvider>,
		);

		await waitFor(() =>
			expect(screen.getAllByText("weight:63").length).toBeGreaterThan(0),
		);
	});

	it("does not overwrite stored data with the seed on mount", async () => {
		const stored: HealthData = { ...initialHealthData, currentWeight: 58 };
		localStorage.setItem("healthData", JSON.stringify(stored));

		const writes: string[] = [];
		vi.spyOn(Storage.prototype, "setItem").mockImplementation((_key, value) => {
			writes.push(String(value));
		});

		render(
			<HealthDataProvider>
				<Probe />
			</HealthDataProvider>,
		);
		await waitFor(() =>
			expect(screen.getByText("weight:58")).toBeInTheDocument(),
		);

		const wroteSeed = writes.some(
			(value) =>
				JSON.parse(value).currentWeight === initialHealthData.currentWeight,
		);
		expect(wroteSeed).toBe(false);
	});
});
