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

test("exercise completion persists and a day can be completed", async ({
	page,
}) => {
	await loginAsUser(page);
	await page.goto("/my-workout-plan");

	const exercise = page.getByRole("checkbox", { name: "Bench Press" });
	await exercise.check();
	await expect(exercise).toBeChecked();

	await page.reload();
	await expect(exercise).toBeChecked();

	const dayCard = page.getByRole("list").first();
	await page
		.getByRole("button", { name: "Mark Day as Complete" })
		.first()
		.click();
	await expect(dayCard.getByRole("checkbox")).toHaveCount(4);
	for (const checkbox of await dayCard.getByRole("checkbox").all()) {
		await expect(checkbox).toBeChecked();
	}

	const completeButton = page
		.getByRole("button", { name: "Day complete" })
		.first();
	await expect(completeButton).toBeVisible();
	await expect(completeButton).toBeDisabled();
});
