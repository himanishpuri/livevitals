"use client";

import { RegisterForm } from "@/components/auth/auth-forms";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function RegisterPage() {
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
		<div className="min-h-screen flex flex-col md:flex-row">
			{/* Left side - Image/Illustration */}
			<div className="hidden md:block md:w-1/2 bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/10 dark:to-background relative overflow-hidden">
				<div className="absolute inset-0 flex items-center justify-center p-12">
					<div className="max-w-md text-center">
						<h2 className="text-2xl font-bold mb-4">
							Join our fitness community
						</h2>
						<p className="text-muted-foreground mb-6">
							Create an account to track your progress, connect with
							instructors, and achieve your fitness goals.
						</p>
						<div className="relative h-64 w-full rounded-xl overflow-hidden shadow-xl">
							<Image
								src="/placeholder.svg?height=400&width=600"
								alt="Fitness tracking"
								fill
								className="object-cover"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Right side - Form */}
			<div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 bg-white dark:bg-background">
				<div className="w-full max-w-md space-y-8">
					<div className="text-center mb-8">
						<div className="flex justify-center mb-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
								<Activity className="h-6 w-6 text-primary" />
							</div>
						</div>
						<h1 className="text-3xl font-bold tracking-tight">
							Create an account
						</h1>
						<p className="text-muted-foreground mt-2">
							Sign up to get started with LiveVitals
						</p>
					</div>

					<RegisterForm />

					<div className="text-center mt-8">
						<p className="text-muted-foreground">
							Already have an account?{" "}
							<Link
								href="/login"
								className="text-primary hover:text-primary/90 font-medium inline-flex items-center"
							>
								<ArrowLeft className="mr-1 h-4 w-4" />
								Sign in here
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
