"use client";

import type React from "react";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface FormStatus {
	type: "success" | "error" | null;
	message: string;
}

export function FormStatusAlert({ status }: { status: FormStatus }) {
	return (
		<AnimatePresence>
			{status.type && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0 }}
				>
					<Alert
						variant={status.type === "success" ? "default" : "destructive"}
					>
						{status.type === "success" ? (
							<CheckCircle2 className="h-5 w-5" />
						) : (
							<AlertCircle className="h-5 w-5" />
						)}
						<AlertDescription>{status.message}</AlertDescription>
					</Alert>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export function formChangeHandler<T extends object>(
	setFormData: Dispatch<SetStateAction<T>>,
) {
	return (
		event: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => {
		const { name, value } = event.target;
		// Event target names match the form state keys, so the spread keeps its shape.
		setFormData((previous) => ({ ...previous, [name]: value }) as T);
	};
}

export function useAuthSubmit(
	submit: () => Promise<boolean>,
	messages: { success: string; failure: string },
) {
	const [isLoading, setIsLoading] = useState(false);
	const [formStatus, setFormStatus] = useState<FormStatus>({
		type: null,
		message: "",
	});

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setIsLoading(true);
		setFormStatus({ type: null, message: "" });

		try {
			const success = await submit();
			setFormStatus(
				success
					? { type: "success", message: messages.success }
					: { type: "error", message: messages.failure },
			);
		} catch {
			setFormStatus({
				type: "error",
				message: "An error occurred. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return { isLoading, formStatus, handleSubmit };
}

export function EmailField({
	value,
	onChange,
}: {
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	return (
		<div className="space-y-2">
			<Label htmlFor="email">Email</Label>
			<Input
				id="email"
				name="email"
				type="email"
				autoComplete="email"
				required
				placeholder="you@example.com"
				value={value}
				onChange={onChange}
				className="h-11"
			/>
		</div>
	);
}

export function RoleSelect({
	value,
	onChange,
}: {
	value: "user" | "instructor";
	onChange: (value: "user" | "instructor") => void;
}) {
	return (
		<div className="space-y-2">
			<Label htmlFor="role">Account Type</Label>
			<Select
				name="role"
				value={value}
				onValueChange={(next) => onChange(next as "user" | "instructor")}
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
	);
}
