"use client";

import Link from "next/link";
import { useTransitionRouter } from "next-view-transitions";
import { Activity, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButtons } from "@/components/auth/auth-buttons";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { useAuth } from "@/context/auth-context";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
	const pathname = usePathname();
	const router = useTransitionRouter();

	// Replace the navLinks array with this dynamic function that returns links based on auth status
	const getNavLinks = (isAuth: boolean, userRole?: string) => {
		// Links visible to all users
		const publicLinks = [
			{ href: "/", label: "Home" },
			{ href: "/about", label: "About" },
		];

		// Links only visible to authenticated users
		const authLinks = [
			{ href: "/dashboard", label: "Dashboard" },
			{ href: "/data-input", label: "Data Input" },
			{ href: "/diet-selection", label: "Diet Plans" },
			{ href: "/profile", label: "Profile" },
			{ href: "/schedule", label: "My Sessions" },
			{ href: "/instructor-chat", label: "Find Instructors" },
		];

		// Links only visible to instructors
		const instructorLinks = [
			{ href: "/instructor/dashboard", label: "Instructor Dashboard" },
		];

		if (!isAuth) return publicLinks;

		return userRole === "instructor"
			? [...publicLinks, ...instructorLinks]
			: [...publicLinks, ...authLinks];
	};

	// Replace the existing navLinks array in the component with this
	const { isAuthenticated, user } = useAuth();
	const navLinks = getNavLinks(isAuthenticated, user?.role);

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4 flex h-16 items-center justify-between">
				<div className="flex items-center gap-2">
					<Link
						href="/"
						className="flex items-center gap-2"
					>
						<Activity className="h-6 w-6 text-primary" />
						<span className="text-xl font-bold">LiveVitals</span>
					</Link>
				</div>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex md:items-center md:space-x-8">
					<div className="flex items-center space-x-6">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								onClick={(e) => {
									e.preventDefault();
									router.push(link.href, {
										onTransitionReady: pageAnimation,
									});
								}}
								className={cn(
									"text-sm font-medium transition-colors hover:text-primary",
									pathname === link.href
										? "text-primary"
										: "text-muted-foreground",
								)}
							>
								{link.label}
							</Link>
						))}
					</div>{" "}
					<ThemeToggle />
					<NotificationDropdown />
					{/* Auth buttons */}
					<AuthButtons />
				</nav>

				{/* Mobile Menu */}
				<Sheet>
					<SheetTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden"
							aria-label="Open Menu"
						>
							<Menu className="h-6 w-6" />
						</Button>
					</SheetTrigger>
					<SheetContent
						side="right"
						className="w-72"
					>
						<SheetHeader>
							<SheetTitle className="flex items-center gap-2">
								<Activity className="h-5 w-5 text-primary" />
								LiveVitals
							</SheetTitle>
						</SheetHeader>
						<nav className="flex flex-col gap-6 px-4 py-6">
							{navLinks.map((link) => (
								<SheetClose
									asChild
									key={link.href}
								>
									<Link
										href={link.href}
										onClick={(e) => {
											e.preventDefault();
											router.push(link.href, {
												onTransitionReady: pageAnimation,
											});
										}}
										className={cn(
											"text-lg font-medium transition-colors hover:text-primary",
											pathname === link.href
												? "text-primary"
												: "text-muted-foreground",
										)}
									>
										{link.label}
									</Link>
								</SheetClose>
							))}
							<div className="flex items-center">
								<ThemeToggle />
								<span className="ml-2 text-sm">Toggle theme</span>
							</div>
							<SheetClose asChild>
								<div className="mt-4">
									<AuthButtons />
								</div>
							</SheetClose>
						</nav>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}

const pageAnimation = () => {
	document.documentElement.animate(
		[
			{
				opacity: 1,
				scale: 1,
				transform: "translateY(0)",
			},
			{
				opacity: 0,
				scale: 0.9,
				transform: "translateY(-100px)",
			},
		],
		{
			duration: 1000,
			easing: "cubic-bezier(0.76, 0, 0.24, 1)",
			fill: "forwards",
			pseudoElement: "::view-transition-old(root)",
		},
	);

	document.documentElement.animate(
		[
			{
				transform: "translateY(100%)",
			},
			{
				transform: "translateY(0)",
			},
		],
		{
			duration: 1000,
			easing: "cubic-bezier(0.76, 0, 0.24, 1)",
			fill: "forwards",
			pseudoElement: "::view-transition-new(root)",
		},
	);
};
