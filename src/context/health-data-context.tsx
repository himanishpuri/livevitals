"use client";

import { createContext, useState, type ReactNode, useEffect } from "react";
import type { HealthData } from "@/types/health-data";
import { initialHealthData } from "@/data/initial-health-data";

export interface HealthDataContextType {
	healthData: HealthData;
	updateHealthData: (newData: Partial<HealthData>) => void;
}

export const HealthDataContext = createContext<HealthDataContextType>({
	healthData: initialHealthData,
	updateHealthData: () => {},
});

function readStoredHealthData(): HealthData {
	if (typeof window === "undefined") return initialHealthData;
	const saved = localStorage.getItem("healthData");
	if (!saved) return initialHealthData;
	try {
		return JSON.parse(saved) as HealthData;
	} catch (error) {
		console.error("Error parsing saved health data:", error);
		return initialHealthData;
	}
}

export function HealthDataProvider({ children }: { children: ReactNode }) {
	const [healthData, setHealthData] = useState<HealthData>(readStoredHealthData);

	// Save data to localStorage when it changes
	useEffect(() => {
		localStorage.setItem("healthData", JSON.stringify(healthData));
	}, [healthData]);

	const updateHealthData = (newData: Partial<HealthData>) => {
		setHealthData((prevData) => ({
			...prevData,
			...newData,
		}));
	};

	return (
		<HealthDataContext.Provider value={{ healthData, updateHealthData }}>
			{children}
		</HealthDataContext.Provider>
	);
}
