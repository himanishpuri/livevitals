"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter as useNextRouter } from "next/navigation";
import {
  Activity,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  LineChart,
  Utensils,
  Users,
  Dumbbell, // Added Dumbbell icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Ensure this path is correct
import { useAuth } from "@/context/auth-context"; // Ensure this path is correct
import { Badge } from "@/components/ui/badge"; // Ensure this path is correct

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const nextRouter = useNextRouter();
  const { user, isAuthenticated, logout } = useAuth(); // Assuming useAuth provides: user object { name, userType, isOnline }, isAuthenticated boolean, logout function

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    nextRouter.push("/");
    closeMenu();
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
  ];

  const authenticatedLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
    },
    {
      href: "/data-input",
      label: "Data Input",
      icon: <LineChart className="h-4 w-4 mr-2" />,
    },
    {
      href: "/diet-selection",
      label: "Diet Plans",
      icon: <Utensils className="h-4 w-4 mr-2" />,
    },
    {
      // New link for Workout Plan
      href: "/my-workout-plan",
      label: "Workout Plan",
      icon: <Dumbbell className="h-4 w-4 mr-2" />,
    },
    {
      href: "/instructors",
      label: "Instructors",
      icon: <Users className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={isOpen ? closeMenu : undefined}
          >
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">LiveVitals</span>
          </Link>
          {isAuthenticated && user?.userType === "instructor" && (
            <Badge variant="outline" className="ml-2 hidden sm:block">
              {" "}
              {/* Hide on very small screens if needed */}
              Instructor
            </Badge>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-4">
          <div className="flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated &&
              authenticatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary flex items-center", // Added flex items-center
                    pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {/* Optional: Show icons on desktop nav as well */}
                  {/* {link.icon}  */}
                  {link.label}
                </Link>
              ))}
          </div>

          <ThemeToggle />

          {isAuthenticated && user ? ( // Added check for user object
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2">
                  <User className="h-4 w-4 mr-2" />
                  {user.name?.split(" ")[0] || "User"} {/* Fallback for name */}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {/* Conditionally render dashboard link based on user type */}
                {user.userType === "instructor" ? (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/instructor/dashboard"
                      className="cursor-pointer"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Instructor Dashboard
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          )}
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
                isOpen ? "top-3 rotate-45" : "top-1.5"
              )}
            />
            <span
              className={cn(
                "absolute top-3 block h-0.5 w-6 bg-current transition-all duration-300",
                isOpen ? "opacity-0" : "opacity-100"
              )}
            />
            <span
              className={cn(
                "absolute block h-0.5 w-6 bg-current transition-all duration-300",
                isOpen ? "top-3 -rotate-45" : "top-[1.125rem]" // Adjusted for better alignment, assuming 0.5 height
              )}
            />
          </div>
        </Button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <button
          className="fixed inset-0 top-16 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={closeMenu}
          onKeyDown={(e) => e.key === "Escape" && closeMenu()}
          aria-label="Close menu overlay"
        />
      )}
      {/* Mobile Navigation Menu */}
      <div
        className={cn(
          "fixed inset-x-0 top-16 z-40 h-[calc(100vh-4rem)] w-full overflow-y-auto bg-background shadow-lg transition-all duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        )}
      >
        <nav className="flex flex-col gap-4 container mx-auto px-4 py-6">
          {isAuthenticated && user?.userType === "instructor" && (
            <div className="bg-primary/10 p-3 rounded-md mb-2">
              <p className="font-medium flex items-center">
                <Badge variant="secondary" className="mr-2">
                  {" "}
                  {/* Changed variant for better contrast */}
                  Instructor Mode
                </Badge>
                {/* Assuming user object has an isOnline property, ensure it's part of your AuthContext user type */}
                {/* <span className={cn("h-2 w-2 rounded-full inline-block mr-2", user.isOnline ? "bg-green-500" : "bg-gray-400")}></span> */}
                {/* {user.isOnline ? "Online" : "Offline"} */}
              </p>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className={cn(
                "text-lg font-medium transition-colors hover:text-primary",
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated && (
            <>
              <div className="h-px bg-border my-2" />
              {authenticatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-primary flex items-center",
                    pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              <Button
                variant="outline"
                className="justify-start text-lg py-3" // Increased padding/text size for mobile
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" /> {/* Slightly larger icon */}
                Logout
              </Button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <div className="h-px bg-border my-2" />
              <Link
                href="/login"
                onClick={closeMenu}
                className="text-lg font-medium transition-colors hover:text-primary"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={closeMenu}
                className="text-lg font-medium transition-colors hover:text-primary"
              >
                Sign up
              </Link>
            </>
          )}

          <div className="flex items-center mt-4">
            <ThemeToggle />
            <span className="ml-2 text-sm">Toggle theme</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
