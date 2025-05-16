"use client";

import { LoginForm } from "@/components/auth/auth-forms";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const { isAuthenticated, user } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isAuthenticated && user) {
			// Redirect based on role
			if (user.role === "instructor") {
				router.push("/instructor/dashboard");
			} else {
				router.push("/dashboard");
			}
		}
	}, [isAuthenticated, user, router]);

	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				<LoginForm />

				<div className="mt-6 text-center">
					<p className="text-gray-600">
						Don&apos;t have an account?{" "}
						<Link
							href="/register"
							className="text-blue-600 hover:text-blue-800 font-medium"
						>
							Register here
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
