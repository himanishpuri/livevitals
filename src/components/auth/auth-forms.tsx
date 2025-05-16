"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export function LoginForm() {
	const { login } = useAuth();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		role: "user" as "user" | "instructor",
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsLoading(true);
		const success = await login(formData);
		setIsLoading(false);

		if (success) {
			// Redirect based on role
			if (formData.role === "instructor") {
				router.push("/instructor/dashboard");
			} else {
				router.push("/dashboard");
			}
		}
	};

	return (
		<div className="p-6 rounded-lg bg-white shadow-md max-w-md w-full">
			<h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
				Sign In
			</h2>

			<form
				onSubmit={handleSubmit}
				className="space-y-4"
			>
				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Email
					</label>
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						required
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						value={formData.email}
						onChange={handleChange}
					/>
				</div>

				<div>
					<label
						htmlFor="password"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Password
					</label>
					<input
						id="password"
						name="password"
						type="password"
						autoComplete="current-password"
						required
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						value={formData.password}
						onChange={handleChange}
					/>
				</div>

				<div>
					<label
						htmlFor="role"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						I am a
					</label>
					<select
						id="role"
						name="role"
						required
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						value={formData.role}
						onChange={handleChange}
					>
						<option value="user">User</option>
						<option value="instructor">Instructor</option>
					</select>
				</div>

				<div className="pt-2">
					<button
						type="submit"
						disabled={isLoading}
						className={`w-full py-2 px-4 rounded-md font-medium text-white ${
							isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
						} transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
					>
						{isLoading ? "Signing In..." : "Sign In"}
					</button>
				</div>
			</form>
		</div>
	);
}

export function RegisterForm() {
	const { register } = useAuth();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		role: "user" as "user" | "instructor",
		specialty: "",
		biography: "",
	});

	const isInstructor = formData.role === "instructor";

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsLoading(true);
		const success = await register(formData);
		setIsLoading(false);

		if (success) {
			// Redirect based on role
			if (formData.role === "instructor") {
				router.push("/instructor/dashboard");
			} else {
				router.push("/dashboard");
			}
		}
	};

	return (
		<div className="p-6 rounded-lg bg-white shadow-md max-w-md w-full">
			<h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
				Create Account
			</h2>

			<form
				onSubmit={handleSubmit}
				className="space-y-4"
			>
				<div>
					<label
						htmlFor="name"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Full Name
					</label>
					<input
						id="name"
						name="name"
						type="text"
						autoComplete="name"
						required
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						value={formData.name}
						onChange={handleChange}
					/>
				</div>

				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Email
					</label>
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						required
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						value={formData.email}
						onChange={handleChange}
					/>
				</div>

				<div>
					<label
						htmlFor="password"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Password
					</label>
					<input
						id="password"
						name="password"
						type="password"
						autoComplete="new-password"
						required
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						value={formData.password}
						onChange={handleChange}
					/>
				</div>

				<div>
					<label
						htmlFor="role"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						I am a
					</label>
					<select
						id="role"
						name="role"
						required
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						value={formData.role}
						onChange={handleChange}
					>
						<option value="user">User</option>
						<option value="instructor">Instructor</option>
					</select>
				</div>

				{isInstructor && (
					<>
						<div>
							<label
								htmlFor="specialty"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Specialty
							</label>
							<input
								id="specialty"
								name="specialty"
								type="text"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={formData.specialty}
								onChange={handleChange}
								placeholder="e.g., Nutrition, Strength Training"
								required={isInstructor}
							/>
						</div>

						<div>
							<label
								htmlFor="biography"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Biography
							</label>
							<textarea
								id="biography"
								name="biography"
								rows={3}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={formData.biography}
								onChange={handleChange}
								placeholder="A brief description of your background and expertise"
								required={isInstructor}
							/>
						</div>
					</>
				)}

				<div className="pt-2">
					<button
						type="submit"
						disabled={isLoading}
						className={`w-full py-2 px-4 rounded-md font-medium text-white ${
							isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
						} transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
					>
						{isLoading ? "Creating Account..." : "Create Account"}
					</button>
				</div>
			</form>
		</div>
	);
}
