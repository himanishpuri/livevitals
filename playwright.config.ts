import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
	testDir: "e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: [["list"], ["html", { open: "never" }]],
	use: {
		baseURL,
		trace: "on-first-retry",
		permissions: ["camera", "microphone"],
		launchOptions: {
			args: [
				"--use-fake-device-for-media-stream",
				"--use-fake-ui-for-media-stream",
			],
		},
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: process.env.E2E_BASE_URL
		? undefined
		: [
				{
					command: "npm --prefix realtime start",
					url: "http://localhost:9000/health",
					reuseExistingServer: !process.env.CI,
				},
				{
					command: "npm run build && npm run start",
					url: "http://localhost:3000",
					timeout: 240_000,
					reuseExistingServer: !process.env.CI,
					env: { NEXT_PUBLIC_REALTIME_URL: "http://localhost:9000" },
				},
			],
});
