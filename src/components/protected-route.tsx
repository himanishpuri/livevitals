"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requireRole?: "user" | "instructor";
}

export default function ProtectedRoute({
	children,
	requireRole,
}: ProtectedRouteProps) {
	const { isAuthenticated, isLoading, user } = useAuth();
	const router = useRouter();
	const wrongRole = Boolean(requireRole && user?.role !== requireRole);

	useEffect(() => {
		if (isLoading) return;
		if (!isAuthenticated) {
			router.replace("/login");
		} else if (wrongRole) {
			router.replace("/");
		}
	}, [isLoading, isAuthenticated, wrongRole, router]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!isAuthenticated || wrongRole) return null;

	return <>{children}</>;
}
