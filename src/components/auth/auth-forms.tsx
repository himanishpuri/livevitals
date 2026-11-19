"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
	EmailField,
	FormStatusAlert,
	RoleSelect,
	formChangeHandler,
	useAuthSubmit,
} from "@/components/auth/auth-form-fields";

export function LoginForm() {
	const { login } = useAuth();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		role: "user" as "user" | "instructor",
	});
	const { isLoading, formStatus, handleSubmit } = useAuthSubmit(
		() => login(formData),
		{
			success: "Login successful! Redirecting...",
			failure: "Invalid credentials. Please try again.",
		},
	);
	const handleChange = formChangeHandler(setFormData);

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
		>
			<FormStatusAlert status={formStatus} />

			<EmailField
				value={formData.email}
				onChange={handleChange}
			/>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label htmlFor="password">Password</Label>
					<Link
						href="/forgot-password"
						className="text-sm text-primary hover:text-primary/90"
					>
						Forgot password?
					</Link>
				</div>
				<Input
					id="password"
					name="password"
					type="password"
					autoComplete="current-password"
					required
					placeholder="••••••••"
					value={formData.password}
					onChange={handleChange}
					className="h-11"
				/>
			</div>

			<RoleSelect
				value={formData.role}
				onChange={(role) => setFormData((prev) => ({ ...prev, role }))}
			/>

			<Button
				type="submit"
				disabled={isLoading}
				className="w-full h-11 text-base"
			>
				{isLoading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing
						In...
					</>
				) : (
					"Sign In"
				)}
			</Button>
		</form>
	);
}

export function RegisterForm() {
	const { register } = useAuth();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		role: "user" as "user" | "instructor",
		specialty: "",
		biography: "",
	});
	const { isLoading, formStatus, handleSubmit } = useAuthSubmit(
		() => register(formData),
		{
			success: "Registration successful! Redirecting...",
			failure: "Registration failed. Please try again.",
		},
	);
	const handleChange = formChangeHandler(setFormData);

	const isInstructor = formData.role === "instructor";

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
		>
			<FormStatusAlert status={formStatus} />

			<div className="space-y-2">
				<Label htmlFor="name">Full Name</Label>
				<Input
					id="name"
					name="name"
					type="text"
					autoComplete="name"
					required
					placeholder="John Doe"
					value={formData.name}
					onChange={handleChange}
					className="h-11"
				/>
			</div>

			<EmailField
				value={formData.email}
				onChange={handleChange}
			/>

			<div className="space-y-2">
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					name="password"
					type="password"
					autoComplete="new-password"
					required
					placeholder="••••••••"
					value={formData.password}
					onChange={handleChange}
					className="h-11"
				/>
				<p className="text-xs text-muted-foreground">
					Password must be at least 8 characters long
				</p>
			</div>

			<RoleSelect
				value={formData.role}
				onChange={(role) => setFormData((prev) => ({ ...prev, role }))}
			/>

			<AnimatePresence>
				{isInstructor && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="space-y-6 overflow-hidden"
					>
						<div className="space-y-2">
							<Label htmlFor="specialty">Specialty</Label>
							<Input
								id="specialty"
								name="specialty"
								type="text"
								placeholder="e.g., Nutrition, Strength Training"
								value={formData.specialty}
								onChange={handleChange}
								required={isInstructor}
								className="h-11"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="biography">Biography</Label>
							<textarea
								id="biography"
								name="biography"
								rows={3}
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
								value={formData.biography}
								onChange={handleChange}
								placeholder="A brief description of your background and expertise"
								required={isInstructor}
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<Button
				type="submit"
				disabled={isLoading}
				className="w-full h-11 text-base"
			>
				{isLoading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
						Account...
					</>
				) : (
					"Create Account"
				)}
			</Button>
		</form>
	);
}
