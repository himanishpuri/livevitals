import type { AuthState } from "@/types/user";

export const authState = {
	current: {
		user: null,
		isAuthenticated: false,
		isLoading: false,
	} as AuthState,
};
