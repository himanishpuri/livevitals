import { test, expect, type Page } from "@playwright/test";

async function signIn(page: Page, email: string) {
	await page.goto("/login");
	await page.getByLabel("Email").fill(email);
	await page.getByLabel("Password").fill("password");
	await page.getByRole("button", { name: "Sign In" }).click();
}

test("anonymous visitor is redirected to login", async ({ page }) => {
	await page.goto("/dashboard");
	await expect(page).toHaveURL(/\/login$/);
});

test("demo user can sign in", async ({ page }) => {
	await signIn(page, "user@example.com");
	await expect(page).toHaveURL(/\/dashboard$/);
});

test("registered user can sign in after logging out", async ({ page }) => {
	const email = `e2e-${Date.now()}@example.com`;

	await page.goto("/register");
	await page.getByLabel("Full Name").fill("E2E Tester");
	await page.getByLabel("Email").fill(email);
	await page.getByLabel("Password").fill("password123");
	await page.getByRole("button", { name: "Create Account" }).click();
	await expect(page).toHaveURL(/\/dashboard$/);

	await page.getByRole("button", { name: "Sign Out" }).click();
	await expect(page).toHaveURL(/\/login$/);

	await page.getByLabel("Email").fill(email);
	await page.getByLabel("Password").fill("password123");
	await page.getByRole("button", { name: "Sign In" }).click();
	await expect(page).toHaveURL(/\/dashboard$/);
});

test("forgot password link opens the reset page", async ({ page }) => {
	await page.goto("/login");
	await page.getByRole("link", { name: "Forgot password?" }).click();
	await expect(page).toHaveURL(/\/forgot-password$/);
});
