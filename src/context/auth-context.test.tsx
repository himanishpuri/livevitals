import { act, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth, type AuthContextType } from "./auth-context";

const { socket } = vi.hoisted(() => ({
	socket: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

vi.mock("@/hooks/use-socket", () => ({
	default: () => ({ socket, isConnected: false, instructors: [] }),
}));

const authRef: { current?: AuthContextType } = {};

function Probe() {
	const auth = useAuth();
	useEffect(() => {
		authRef.current = auth;
	});

	return (
		<div>
			{auth.isLoading
				? "loading"
				: auth.isAuthenticated
					? `in:${auth.user?.email}`
					: "anon"}
		</div>
	);
}

const renderAuth = () =>
	render(
		<AuthProvider>
			<Probe />
		</AuthProvider>,
	);

const waitForAnon = () =>
	waitFor(() => expect(screen.getByText("anon")).toBeInTheDocument(), {
		timeout: 3000,
	});

const auth = () => authRef.current!;

describe("AuthProvider", () => {
	it("logs in a demo user", async () => {
		renderAuth();
		await waitForAnon();

		await act(async () => {
			await auth().login({
				email: "user@example.com",
				password: "password",
				role: "user",
			});
		});

		expect(screen.getByText("in:user@example.com")).toBeInTheDocument();
	});

	it("rejects a wrong password", async () => {
		renderAuth();
		await waitForAnon();

		let ok = true;
		await act(async () => {
			ok = await auth().login({
				email: "user@example.com",
				password: "wrong",
				role: "user",
			});
		});

		expect(ok).toBe(false);
		expect(screen.getByText("anon")).toBeInTheDocument();
	});

	it("logs in with an account that was just registered", async () => {
		renderAuth();
		await waitForAnon();

		await act(async () => {
			await auth().register({
				name: "Test Person",
				email: "test.person@example.com",
				password: "secret123",
				role: "user",
			});
		});
		expect(screen.getByText("in:test.person@example.com")).toBeInTheDocument();

		act(() => auth().logout());
		await waitForAnon();

		let ok = false;
		await act(async () => {
			ok = await auth().login({
				email: "test.person@example.com",
				password: "secret123",
				role: "user",
			});
		});

		expect(ok).toBe(true);
		expect(screen.getByText("in:test.person@example.com")).toBeInTheDocument();
	});

	it("rejects registering an email that already exists", async () => {
		renderAuth();
		await waitForAnon();

		let ok = true;
		await act(async () => {
			ok = await auth().register({
				name: "Copy Cat",
				email: "user@example.com",
				password: "secret123",
				role: "user",
			});
		});

		expect(ok).toBe(false);
	});

	it("clears livevitals_user on logout", async () => {
		renderAuth();
		await waitForAnon();

		await act(async () => {
			await auth().login({
				email: "user@example.com",
				password: "password",
				role: "user",
			});
		});
		expect(localStorage.getItem("livevitals_user")).not.toBeNull();

		act(() => auth().logout());

		expect(localStorage.getItem("livevitals_user")).toBeNull();
	});
});
