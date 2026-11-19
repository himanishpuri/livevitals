"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export function AuthButtons() {
	const { user, isAuthenticated, logout } = useAuth();
	const router = useRouter();

	if (isAuthenticated && user) {
		return (
			<div className="flex items-center gap-4">
				<div
					className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
					onClick={() => {
						if (user.role === "instructor") {
							router.push("/instructor/dashboard");
						} else {
							router.push("/dashboard");
						}
					}}
				>
					<Avatar className="size-8 border-2 border-primary">
						{user.profileImage && (
							<AvatarImage src={user.profileImage} alt={user.name} />
						)}
						<AvatarFallback className="bg-primary/10">
							<User className="h-4 w-4 text-primary" />
						</AvatarFallback>
					</Avatar>
					<span className="text-sm font-medium hidden sm:block">
						{user.name}
					</span>
				</div>

				<Button
					variant="ghost"
					size="sm"
					onClick={() => {
						logout();
						router.push("/login");
					}}
				>
					<LogOut className="h-4 w-4 mr-1" />
					<span className="hidden sm:block">Sign Out</span>
				</Button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<Button
				variant="ghost"
				size="sm"
				asChild
			>
				<Link href="/login">Sign In</Link>
			</Button>
			<Button
				size="sm"
				asChild
			>
				<Link href="/register">Sign Up</Link>
			</Button>
		</div>
	);
}
