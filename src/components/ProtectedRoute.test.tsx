import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AuthState } from "@/types/user";
import ProtectedRoute from "./ProtectedRoute";

const replace = vi.hoisted(() => vi.fn());
const authState = vi.hoisted(() => ({
	current: { user: null, isAuthenticated: false, isLoading: false } as AuthState,
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn(), replace }),
}));

vi.mock("@/context/auth-context", () => ({
	useAuth: () => authState.current,
}));

const user = { id: "john-smith", name: "John", email: "j@example.com", role: "instructor" as const };

describe("ProtectedRoute", () => {
	it("sends anonymous visitors to login without rendering children", async () => {
		authState.current = { user: null, isAuthenticated: false, isLoading: false };

		render(<ProtectedRoute><p>secret</p></ProtectedRoute>);

		await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
		expect(screen.queryByText("secret")).not.toBeInTheDocument();
	});

	it("sends a user with the wrong role home", async () => {
		authState.current = {
			user: { ...user, role: "user" },
			isAuthenticated: true,
			isLoading: false,
		};

		render(<ProtectedRoute requireRole="instructor"><p>secret</p></ProtectedRoute>);

		await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
		expect(screen.queryByText("secret")).not.toBeInTheDocument();
	});

	it("renders children for an authenticated user with the right role", () => {
		authState.current = { user, isAuthenticated: true, isLoading: false };

		render(<ProtectedRoute requireRole="instructor"><p>secret</p></ProtectedRoute>);

		expect(screen.getByText("secret")).toBeInTheDocument();
	});
});
