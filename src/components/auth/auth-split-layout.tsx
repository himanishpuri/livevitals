"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface AuthSplitLayoutProps {
	imageSide: "left" | "right";
	image: {
		src: string;
		alt: string;
		title: string;
		description: string;
	};
	title: string;
	subtitle: string;
	children: ReactNode;
	footer: ReactNode;
}

export function AuthSplitLayout({
	imageSide,
	image,
	title,
	subtitle,
	children,
	footer,
}: AuthSplitLayoutProps) {
	const { isAuthenticated, user } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isAuthenticated && user) {
			router.push(
				user.role === "instructor" ? "/instructor/dashboard" : "/dashboard",
			);
		}
	}, [isAuthenticated, user, router]);

	const imageColumn = (
		<div className="hidden md:block md:w-1/2 bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/10 dark:to-background relative overflow-hidden">
			<div className="absolute inset-0 flex items-center justify-center p-12">
				<div className="max-w-md text-center">
					<h2 className="text-2xl font-bold mb-4">{image.title}</h2>
					<p className="text-muted-foreground mb-6">{image.description}</p>
					<div className="relative h-64 w-full rounded-xl overflow-hidden shadow-xl">
						<Image
							src={image.src}
							alt={image.alt}
							fill
							sizes="(min-width: 1024px) 50vw, 100vw"
							className="object-cover"
						/>
					</div>
				</div>
			</div>
		</div>
	);

	const formColumn = (
		<div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 bg-background">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center mb-8">
					<div className="flex justify-center mb-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<Activity className="h-6 w-6 text-primary" />
						</div>
					</div>
					<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
					<p className="text-muted-foreground mt-2">{subtitle}</p>
				</div>

				{children}

				<div className="text-center mt-8">{footer}</div>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen flex flex-col md:flex-row">
			{imageSide === "left" ? imageColumn : formColumn}
			{imageSide === "left" ? formColumn : imageColumn}
		</div>
	);
}
