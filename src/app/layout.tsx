import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ViewTransitions } from "next-view-transitions";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/auth-context";
import { NotificationProvider } from "@/context/notification-context";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
	title: "LiveVitals - Video Calling Health App",
	description: "Connect with healthcare professionals through video calls",
};

export default function RootLayout({
	children,
}: {
	readonly children: React.ReactNode;
}) {
	return (
		<ViewTransitions>
			<html
				lang="en"
				suppressHydrationWarning
				className={inter.variable}
			>
				<body className="font-sans antialiased">
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
						<AuthProvider>
							<NotificationProvider>
								<div className="flex min-h-screen flex-col">
									<Navbar />
									<div className="flex-1">{children}</div>
									<Footer />
								</div>
								<Toaster richColors />
							</NotificationProvider>
						</AuthProvider>
					</ThemeProvider>
				</body>
			</html>
		</ViewTransitions>
	);
}
