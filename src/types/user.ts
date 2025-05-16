export interface User {
	id: string;
	name: string;
	email: string;
	role: "user" | "instructor";
	profileImage?: string;
	specialty?: string; // For instructors
	biography?: string; // For instructors
}

export interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

export interface LoginCredentials {
	email: string;
	password: string;
	role: "user" | "instructor";
}

export interface RegisterData extends LoginCredentials {
	name: string;
	specialty?: string; // For instructors
	biography?: string; // For instructors
}
