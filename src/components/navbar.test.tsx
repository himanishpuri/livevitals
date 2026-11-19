import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AuthState } from "@/types/user";
import Navbar from "./navbar";

const authState = vi.hoisted(() => ({
	current: {
		user: null,
		isAuthenticated: false,
		isLoading: false,
	} as AuthState,
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
	usePathname: () => "/",
}));

vi.mock("@/context/auth-context", () => ({
	useAuth: () => authState.current,
}));

vi.mock("@/components/notification-dropdown", () => ({
	NotificationDropdown: () => <div data-testid="bell" />,
}));

const user = {
	id: "user-1",
	name: "Demo User",
	email: "user@example.com",
	role: "user" as const,
};

describe("Navbar", () => {
	it("hides app links and the bell from anonymous visitors", () => {
		authState.current = {
			user: null,
			isAuthenticated: false,
			isLoading: false,
		};

		render(<Navbar />);

		expect(
			screen.queryByRole("link", { name: "Dashboard" }),
		).not.toBeInTheDocument();
		expect(screen.queryByTestId("bell")).not.toBeInTheDocument();
	});

	it("shows the workout plan link to a logged-in user", () => {
		authState.current = { user, isAuthenticated: true, isLoading: false };

		render(<Navbar />);

		expect(
			screen.getAllByRole("link", { name: "Workout Plan" })[0],
		).toHaveAttribute("href", "/my-workout-plan");
	});

	it("shows the instructor dashboard link to an instructor", () => {
		authState.current = {
			user: {
				id: "john-smith",
				name: "John Smith",
				email: "john@example.com",
				role: "instructor" as const,
			},
			isAuthenticated: true,
			isLoading: false,
		};

		render(<Navbar />);

		expect(
			screen.getAllByRole("link", { name: "Instructor Dashboard" })[0],
		).toHaveAttribute("href", "/instructor/dashboard");
	});
});
