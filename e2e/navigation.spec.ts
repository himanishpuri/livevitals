import { test, expect } from "@playwright/test";

test("home page shows the hero heading", async ({ page }) => {
	await page.goto("/");
	await expect(
		page.getByRole("heading", { level: 1, name: /LiveVitals/ }),
	).toBeVisible();
});

test("About link opens the About page", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("link", { name: "About", exact: true }).first().click();
	await expect(page.getByRole("heading", { name: "About Us" })).toBeVisible();
});

test("theme toggle flips the dark class and survives reload", async ({
	page,
}) => {
	await page.goto("/");
	await page
		.getByRole("button", { name: /Switch to (dark|light) theme/ })
		.click();
	await expect(page.locator("html")).toHaveClass(/dark/);
	await page.reload();
	await expect(page.locator("html")).toHaveClass(/dark/);
});

test.describe("mobile", () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test("menu button opens the sheet and its About link navigates", async ({
		page,
	}) => {
		await page.goto("/");
		await page.getByRole("button", { name: "Open Menu" }).click();
		await page.getByRole("link", { name: "About", exact: true }).click();
		await expect(page.getByRole("heading", { name: "About Us" })).toBeVisible();
	});
});
