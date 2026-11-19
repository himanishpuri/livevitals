import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
	it("merges conflicting Tailwind classes, keeping the last", () => {
		expect(cn("p-2 text-sm", "p-4")).toBe("text-sm p-4");
	});

	it("skips falsy values", () => {
		expect(cn("p-2", false, undefined, "text-sm")).toBe("p-2 text-sm");
	});
});
