import { test, expect, type Page } from "@playwright/test";

async function signIn(page: Page, email: string, role?: "Instructor") {
	await page.goto("/login");
	await page.getByLabel("Email").fill(email);
	await page.getByLabel("Password").fill("password");
	if (role) {
		await page.getByRole("combobox").click();
		await page.getByRole("option", { name: role }).click();
	}
	await page.getByRole("button", { name: "Sign In" }).click();
}

async function expectLiveRemoteVideo(page: Page) {
	await page.waitForFunction(
		() =>
			Array.from(document.querySelectorAll("video")).some((video) => {
				const stream = video.srcObject as MediaStream | null;
				return (
					!video.muted &&
					!!stream &&
					stream
						.getVideoTracks()
						.some((track) => track.readyState === "live")
				);
			}),
		undefined,
		{ timeout: 30_000 },
	);
}

test("user chats with the instructor and their video call connects", async ({
	browser,
}) => {
	test.setTimeout(120_000);

	const instructorContext = await browser.newContext();
	const userContext = await browser.newContext();
	const instructor = await instructorContext.newPage();
	const user = await userContext.newPage();

	await signIn(instructor, "john@example.com", "Instructor");
	await expect(instructor).toHaveURL(/\/instructor\/dashboard$/);
	await expect(
		instructor.getByRole("heading", { name: "Instructor Dashboard" }),
	).toBeVisible();

	await signIn(user, "user@example.com");
	await expect(user).toHaveURL(/\/dashboard$/);
	await user.goto("/instructor-chat/john-smith");
	await expect(
		user.getByRole("heading", { name: "Session with John Smith" }),
	).toBeVisible();

	// Chat: the instructor receives a notification for the message.
	await user.getByRole("tab", { name: "Text Chat" }).click();
	await user.getByPlaceholder("Type a message...").fill("hello");
	await user.getByRole("button", { name: "Send message" }).click();
	await expect(
		instructor.getByRole("button", { name: "Notifications" }),
	).toHaveText("1");

	// Video call: the instructor answers and both sides get a live remote track.
	await user.getByRole("tab", { name: "Video Call" }).click();
	const startCall = user.getByRole("button", { name: "Start call" });
	await expect(startCall).toBeEnabled({ timeout: 15_000 });
	await startCall.click();
	await instructor.getByRole("button", { name: "Answer" }).click();
	await expect(instructor).toHaveURL(
		/\/instructor-chat\/john-smith\?caller=/,
	);

	await expectLiveRemoteVideo(user);
	await expectLiveRemoteVideo(instructor);

	await instructorContext.close();
	await userContext.close();
});
