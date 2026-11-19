import { expect, type Page } from "@playwright/test";

export async function loginAsUser(page: Page) {
	await page.goto("/login");
	await page.getByLabel("Email").fill("user@example.com");
	await page.getByLabel("Password").fill("password");
	await page.getByRole("button", { name: "Sign In" }).click();
	await expect(page).toHaveURL(/\/dashboard$/);
}
