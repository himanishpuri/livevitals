"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { User, AuthState, LoginCredentials, RegisterData } from "@/types/user";
import useSocket from "@/hooks/useSocket";

// Demo users for development (replace with real authentication in production)
const DEMO_USERS = [
	{
		id: "user-1",
		name: "Demo User",
		email: "user@example.com",
		password: "password", // In a real app, never store plain text passwords
		role: "user",
	},
	{
		id: "john-smith",
		name: "John Smith",
		email: "john@example.com",
		password: "password",
		role: "instructor",
		specialty: "Nutrition & Weight Management",
		biography:
			"John is a certified nutrition coach with 10+ years of experience helping clients achieve their health goals through balanced diet and lifestyle changes.",
		profileImage: "/instructors/male.jpg",
	},
	{
		id: "sarah-johnson",
		name: "Sarah Johnson",
		email: "sarah@example.com",
		password: "password",
		role: "instructor",
		specialty: "Strength Training",
		biography:
			"Sarah specializes in strength training and functional fitness, helping clients build muscle and improve overall body composition.",
		profileImage: "/instructors/female.webp",
	},
];

interface AuthContextType extends AuthState {
	login: (credentials: LoginCredentials) => Promise<boolean>;
	register: (data: RegisterData) => Promise<boolean>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { socket } = useSocket();
	const [authState, setAuthState] = useState<AuthState>({
		user: null,
		isAuthenticated: false,
		isLoading: true,
	});

	// Check for saved user data on load
	useEffect(() => {
		const checkAuth = () => {
			try {
				const savedUser = localStorage.getItem("livevitals_user");
				if (savedUser) {
					const user = JSON.parse(savedUser) as User;
					setAuthState({
						user,
						isAuthenticated: true,
						isLoading: false,
					});

					// If it's an instructor, notify the server
					if (user.role === "instructor") {
						socket?.emit("instructor_signin", user.id);
					}
				} else {
					setAuthState({
						user: null,
						isAuthenticated: false,
						isLoading: false,
					});
				}
			} catch (error) {
				console.error("Error restoring auth state:", error);
				setAuthState({
					user: null,
					isAuthenticated: false,
					isLoading: false,
				});
			}
		};

		// Small delay to ensure socket is initialized
		const timer = setTimeout(checkAuth, 500);
		return () => clearTimeout(timer);
	}, [socket]);

	const login = async (credentials: LoginCredentials): Promise<boolean> => {
		// In a real app, this would be an API call
		try {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 1000));

			const user = DEMO_USERS.find(
				(u) =>
					u.email === credentials.email &&
					u.password === credentials.password &&
					u.role === credentials.role,
			);

			if (!user) {
				throw new Error("Invalid credentials");
			}

			// Create a user without the password
			const { password, ...userWithoutPassword } = user;
			const authenticatedUser = userWithoutPassword as User;

			// Update state
			setAuthState({
				user: authenticatedUser,
				isAuthenticated: true,
				isLoading: false,
			});

			// Save to local storage
			localStorage.setItem(
				"livevitals_user",
				JSON.stringify(authenticatedUser),
			);

			// If it's an instructor, notify the server
			if (authenticatedUser.role === "instructor") {
				socket?.emit("instructor_signin", authenticatedUser.id);
			}

			toast.success(`Welcome back, ${authenticatedUser.name}!`);
			return true;
		} catch (error) {
			let message = "Login failed. Please try again.";
			if (error instanceof Error) {
				message = error.message;
			}
			toast.error(message);
			return false;
		}
	};

	const register = async (data: RegisterData): Promise<boolean> => {
		// In a real app, this would be an API call
		try {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Check if user already exists
			const userExists = DEMO_USERS.some((u) => u.email === data.email);
			if (userExists) {
				throw new Error("User with this email already exists");
			}

			// For demo purposes, just generate a new UUID
			const newUser: User = {
				id:
					data.role === "instructor"
						? data.email.split("@")[0]
						: `user-${Date.now()}`,
				name: data.name,
				email: data.email,
				role: data.role,
				profileImage:
					data.role === "instructor"
						? data.name.toLowerCase().includes("sarah") ||
						  data.name.toLowerCase().includes("lisa")
							? "/instructors/female.webp"
							: "/instructors/male.jpg"
						: undefined,
				specialty: data.specialty,
				biography: data.biography,
			};

			// In a real app, would save to database
			// For demo, we'll just simulate success

			// Update state
			setAuthState({
				user: newUser,
				isAuthenticated: true,
				isLoading: false,
			});

			// Save to local storage
			localStorage.setItem("livevitals_user", JSON.stringify(newUser));

			// If it's an instructor, notify the server
			if (newUser.role === "instructor") {
				socket?.emit("instructor_signin", newUser.id);
			}

			toast.success(`Welcome, ${newUser.name}!`);
			return true;
		} catch (error) {
			let message = "Registration failed. Please try again.";
			if (error instanceof Error) {
				message = error.message;
			}
			toast.error(message);
			return false;
		}
	};

	const logout = () => {
		// If it's an instructor, notify the server about signout
		if (authState.user?.role === "instructor") {
			socket?.emit("instructor_signout", authState.user.id);
		}

		// Clear local storage
		localStorage.removeItem("livevitals_user");

		// Update state
		setAuthState({
			user: null,
			isAuthenticated: false,
			isLoading: false,
		});

		toast.info("You have been logged out");
	};

	return (
		<AuthContext.Provider
			value={{
				...authState,
				login,
				register,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
