"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const subscribe = () => () => {};

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	// The theme is unknown during SSR; derive the label from it only after hydration.
	const mounted = useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	);
	const next = mounted && resolvedTheme === "dark" ? "light" : "dark";

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(next)}
			aria-label={`Switch to ${next} theme`}
		>
			<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
			<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
