"use client";

import { LoginForm } from "@/components/auth/auth-forms";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
	return (
		<AuthSplitLayout
			imageSide="right"
			image={{
				src: "/placeholder.svg",
				alt: "Fitness consultation",
				title: "Connect with expert instructors",
				description:
					"Get personalized guidance and support for your fitness journey through secure video consultations.",
			}}
			title="Welcome back"
			subtitle="Sign in to your account to continue"
			footer={
				<p className="text-muted-foreground">
					Don&apos;t have an account?{" "}
					<Link
						href="/register"
						className="text-primary hover:text-primary/90 font-medium inline-flex items-center"
					>
						Register here
						<ArrowRight className="ml-1 h-4 w-4" />
					</Link>
				</p>
			}
		>
			<LoginForm />
		</AuthSplitLayout>
	);
}
