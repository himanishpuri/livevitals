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

export function HealthDataProvider({ children }: { children: ReactNode }) {
	const [healthData, setHealthData] = useState<HealthData>(initialHealthData);
	const [isHydrated, setIsHydrated] = useState(false);

	// Load data from localStorage on initial mount
	useEffect(() => {
		const savedData = localStorage.getItem("healthData");
		if (savedData) {
			try {
				setHealthData(JSON.parse(savedData));
			} catch (error) {
				console.error("Error parsing saved health data:", error);
			}
		}
		setIsHydrated(true);
	}, []);

	// Save data to localStorage when it changes (only after the stored data loaded)
	useEffect(() => {
		if (!isHydrated) return;
		localStorage.setItem("healthData", JSON.stringify(healthData));
	}, [healthData, isHydrated]);

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
