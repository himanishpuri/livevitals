import { test, expect } from "@playwright/test";
import { loginAsUser } from "./helpers";

test("weight saved on the data input page shows on the dashboard", async ({
	page,
}) => {
	await loginAsUser(page);

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
