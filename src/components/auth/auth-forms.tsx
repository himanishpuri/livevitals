"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LoginForm() {
	const { login } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		role: "user" as "user" | "instructor",
	});
	const [formStatus, setFormStatus] = useState<{
		type: "success" | "error" | null;
		message: string;
	}>({ type: null, message: "" });

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
		setFormStatus({ type: null, message: "" });

		try {
			const success = await login(formData);

			if (success) {
				setFormStatus({
					type: "success",
					message: "Login successful! Redirecting...",
				});
				// Redirect is handled by the useEffect in the parent component
			} else {
				setFormStatus({
					type: "error",
					message: "Invalid credentials. Please try again.",
				});
			}
		} catch (error) {
			setFormStatus({
				type: "error",
				message: "An error occurred. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
		>
			<AnimatePresence>
				{formStatus.type && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0 }}
						className={`p-4 rounded-lg ${
							formStatus.type === "success"
								? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
								: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
						} flex items-start`}
					>
						{formStatus.type === "success" ? (
							<CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
						) : (
							<AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
						)}
						<span>{formStatus.message}</span>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					required
					placeholder="you@example.com"
					value={formData.email}
					onChange={handleChange}
					className="h-11"
				/>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label htmlFor="password">Password</Label>
					<a
						href="#"
						className="text-sm text-primary hover:text-primary/90"
					>
						Forgot password?
					</a>
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

			<div className="space-y-2">
				<Label htmlFor="role">Account Type</Label>
				<Select
					name="role"
					value={formData.role}
					onValueChange={(value) =>
						setFormData((prev) => ({ ...prev, role: value as any }))
					}
				>
					<SelectTrigger className="h-11 w-full">
						<SelectValue placeholder="Select account type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="user">User</SelectItem>
						<SelectItem value="instructor">Instructor</SelectItem>
					</SelectContent>
				</Select>
			</div>

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
	const [formStatus, setFormStatus] = useState<{
		type: "success" | "error" | null;
		message: string;
	}>({ type: null, message: "" });

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
		setFormStatus({ type: null, message: "" });

		try {
			const success = await register(formData);

			if (success) {
				setFormStatus({
					type: "success",
					message: "Registration successful! Redirecting...",
				});
				// Redirect is handled by the useEffect in the parent component
			} else {
				setFormStatus({
					type: "error",
					message: "Registration failed. Please try again.",
				});
			}
		} catch (error) {
			setFormStatus({
				type: "error",
				message: "An error occurred. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
		>
			<AnimatePresence>
				{formStatus.type && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0 }}
						className={`p-4 rounded-lg ${
							formStatus.type === "success"
								? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
								: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
						} flex items-start`}
					>
						{formStatus.type === "success" ? (
							<CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
						) : (
							<AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
						)}
						<span>{formStatus.message}</span>
					</motion.div>
				)}
			</AnimatePresence>

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

			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					required
					placeholder="you@example.com"
					value={formData.email}
					onChange={handleChange}
					className="h-11"
				/>
			</div>

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

			<div className="space-y-2">
				<Label htmlFor="role">Account Type</Label>
				<Select
					name="role"
					value={formData.role}
					onValueChange={(value) =>
						setFormData((prev) => ({ ...prev, role: value as any }))
					}
				>
					<SelectTrigger className="h-11 w-full">
						<SelectValue placeholder="Select account type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="user">User</SelectItem>
						<SelectItem value="instructor">Instructor</SelectItem>
					</SelectContent>
				</Select>
			</div>

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
