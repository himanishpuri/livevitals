import { test, expect } from "@playwright/test";

test("weight saved on the data input page shows on the dashboard", async ({
	page,
}) => {
	await page.goto("/login");
	await page.getByLabel("Email").fill("user@example.com");
	await page.getByLabel("Password").fill("password");
	await page.getByRole("button", { name: "Sign In" }).click();
	await expect(page).toHaveURL(/\/dashboard$/);

	await page.goto("/data-input");
	const weightSlider = page.getByRole("slider").first();
	await weightSlider.focus();
	await weightSlider.press("End");
	await expect(page.getByText("150.0 kg")).toBeVisible();
	await page.getByRole("button", { name: "Save Measurements" }).click();
	await expect(
		page.getByText("Weight and height data saved successfully"),
	).toBeVisible();

	await page.goto("/dashboard");
	await expect(page.getByText("150 kg", { exact: true })).toBeVisible();
});
