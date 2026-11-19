"use client";

import { RegisterForm } from "@/components/auth/auth-forms";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
	return (
		<AuthSplitLayout
			imageSide="left"
			image={{
				src: "/placeholder.svg",
				alt: "Fitness tracking",
				title: "Join our fitness community",
				description:
					"Create an account to track your progress, connect with instructors, and achieve your fitness goals.",
			}}
			title="Create an account"
			subtitle="Sign up to get started with LiveVitals"
			footer={
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
			}
		>
			<RegisterForm />
		</AuthSplitLayout>
	);
}
