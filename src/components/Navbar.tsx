"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter as useNextRouter } from "next/navigation"; // Import Next.js router
// import { useTransitionRouter } from "next-view-transitions"; // Keep commented
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle"; // Make sure this path is correct

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const nextRouter = useNextRouter(); // Initialize Next.js router
  // const router = useTransitionRouter(); // Keep commented

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

  // Define routes for auth buttons
  const loginPath = "/login";
  const signupPath = "/signup";
  // You can also define a path for "Get Started" if it navigates
  // const getStartedPath = "/register"; // Example

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={isOpen ? closeMenu : undefined} // Close mobile menu if open
          >
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">LiveVitals</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-2">
          {" "}
          {/* Reduced space-x slightly for more buttons */}
          <div className="flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                // onClick={(e) => { // Using Link's href is usually sufficient
                //     e.preventDefault();
                //     nextRouter.push(link.href);
                // }}
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
          </div>
          <ThemeToggle />
          <Link href={loginPath} passHref>
            <Button variant="outline" size="sm">
              Login
            </Button>
          </Link>
          <Link href={signupPath} passHref>
            <Button size="sm">Sign Up</Button>
          </Link>
          {/* Optional: Keep Get Started or repurpose it
                    <Link href={getStartedPath} passHref>
                        <Button size="sm">Get Started</Button>
                    </Link>
                    */}
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
                isOpen ? "top-3 -rotate-45" : "top-4.5" // Corrected from top-4.5 to top-[1.125rem] or similar if needed, or ensure parent has enough height
              )}
            />
          </div>
        </Button>
      </div>

      {/* Mobile Navigation Overlay & Menu */}
      {isOpen && (
        <button
          className="fixed inset-0 top-16 z-30 bg-background/80 backdrop-blur-sm md:hidden" // ensure it's hidden on md+
          onClick={closeMenu}
          onKeyDown={(e) => e.key === "Escape" && closeMenu()}
          aria-label="Close menu overlay"
        />
      )}
      <div
        className={cn(
          "fixed inset-x-0 top-16 z-40 h-[calc(100vh-4rem)] w-full overflow-y-auto bg-background shadow-lg transition-all duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        )}
      >
        <nav className="flex flex-col gap-6 container mx-auto px-4 py-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu} // Close menu on link click
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
          <div className="border-t pt-6">
            <div className="flex flex-col space-y-3">
              <Link href={loginPath} passHref className="w-full">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={closeMenu}
                >
                  Login
                </Button>
              </Link>
              <Link href={signupPath} passHref className="w-full">
                <Button className="w-full" onClick={closeMenu}>
                  Sign Up
                </Button>
              </Link>
              {/* Optional: Keep Get Started or repurpose it
                            <Link href={getStartedPath} passHref className="w-full">
                                <Button className="w-full" onClick={closeMenu}>Get Started</Button>
                            </Link>
                            */}
            </div>
            <div className="flex items-center mt-6">
              <ThemeToggle />
              <span className="ml-2 text-sm">Toggle theme</span>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
