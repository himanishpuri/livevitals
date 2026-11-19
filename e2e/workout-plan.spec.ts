import { test, expect } from "@playwright/test";
import { loginAsUser } from "./helpers";

const WEEK_DAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

test("weekly plan lists seven days and opens exercise details", async ({
	page,
}) => {
	await loginAsUser(page);

	await page.goto("/my-workout-plan");
	await expect(
		page.getByRole("heading", { name: "My Weekly Workout Plan" }),
	).toBeVisible();
	for (const day of WEEK_DAYS) {
		await expect(page.getByText(day, { exact: true })).toBeVisible();
	}

	await page.getByRole("button", { name: "Exercise details" }).first().click();
	const dialog = page.getByRole("dialog");
	await expect(dialog).toBeVisible();
	await expect(
		dialog.getByRole("heading", { name: "Bench Press" }),
	).toBeVisible();
});
