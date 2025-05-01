"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();

	const toggleMenu = () => {
		setIsOpen(!isOpen);
	};

	const closeMenu = () => {
		setIsOpen(false);
	};

	const navLinks = [
		{ href: "/", label: "Home" },
		{ href: "/about", label: "About" },
	];

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
					</div>
					<Button size="sm">Get Started</Button>
				</nav>

				{/* Mobile Menu Button */}
				<Button
					variant="ghost"
					size="icon"
					className="relative md:hidden"
					onClick={toggleMenu}
					aria-label={isOpen ? "Close Menu" : "Open Menu"}
				>
					<div className="relative h-6 w-6">
						<span
							className={cn(
								"absolute block h-0.5 w-6 bg-current transition-all duration-300",
								isOpen ? "top-3 rotate-45" : "top-1.5",
							)}
						/>
						<span
							className={cn(
								"absolute top-3 block h-0.5 w-6 bg-current transition-all duration-300",
								isOpen ? "opacity-0" : "opacity-100",
							)}
						/>
						<span
							className={cn(
								"absolute block h-0.5 w-6 bg-current transition-all duration-300",
								isOpen ? "top-3 -rotate-45" : "top-4.5",
							)}
						/>
					</div>
				</Button>
			</div>

			{/* Mobile Navigation */}
			{isOpen && (
				<div
					className="fixed inset-0 top-16 z-30 bg-background/80 backdrop-blur-sm transition-all duration-300"
					onClick={closeMenu}
				/>
			)}
			<div
				className={cn(
					"fixed inset-x-0 top-16 z-40 h-[calc(100vh-4rem)] w-full overflow-y-auto bg-background shadow-lg transition-all duration-300 ease-in-out md:hidden",
					isOpen
						? "translate-x-0 opacity-100"
						: "translate-x-full opacity-0",
				)}
			>
				<nav className="flex flex-col gap-6 container mx-auto px-4 py-6">
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							onClick={closeMenu}
							className={cn(
								"text-lg font-medium transition-colors hover:text-primary",
								pathname === link.href
									? "text-primary"
									: "text-muted-foreground",
							)}
						>
							{link.label}
						</Link>
					))}
					<Button className="mt-4 w-full sm:w-auto">Get Started</Button>
				</nav>
			</div>
		</header>
	);
}
