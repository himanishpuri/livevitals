import type React from "react";
import { ViewTransition } from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { MotionProvider } from "@/components/motion-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { HealthDataProvider } from "@/context/health-data-context";
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
		<html lang="en" suppressHydrationWarning className={inter.variable}>
			<body className="font-sans antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<AuthProvider>
						<HealthDataProvider>
							<NotificationProvider>
								<MotionProvider>
									<div className="flex min-h-screen flex-col">
										<Navbar />
										<div className="flex-1">
											<ViewTransition>{children}</ViewTransition>
										</div>
										<Footer />
									</div>
								</MotionProvider>
								<Toaster richColors />
							</NotificationProvider>
						</HealthDataProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
