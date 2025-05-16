"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import Image from "next/image";
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
					<div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary">
						{user.profileImage ? (
							<Image
								src={user.profileImage}
								alt={user.name}
								width={32}
								height={32}
								className="object-cover"
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									target.src = `https://via.placeholder.com/32?text=${user.name.charAt(
										0,
									)}`;
								}}
							/>
						) : (
							<div className="w-full h-full bg-primary/10 flex items-center justify-center">
								<User className="h-4 w-4 text-primary" />
							</div>
						)}
					</div>
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
