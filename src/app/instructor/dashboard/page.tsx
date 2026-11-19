"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import useSocket from "@/hooks/useSocket";
import PageWrapper from "@/components/PageWrapper";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function InstructorDashboard() {
	const { user, isAuthenticated, logout } = useAuth();
	const router = useRouter();
	const { socket, isConnected } = useSocket();
	const [activeUsers, setActiveUsers] = useState<number>(0);
	const [pendingCalls, setPendingCalls] = useState<
		{ id: string; name: string }[]
	>([]);

	useEffect(() => {
		if (user?.role !== "instructor") return;
		const instructorId = user.id;

		// Register as an online instructor. Identify first: calls are routed to
		// the user room, and a reconnect leaves both unset on the server.
		const goOnline = () => {
			socket.emit("identify", {
				userId: instructorId,
				role: "instructor",
			});
			socket.emit("instructor_signin", instructorId);
		};
		goOnline();

		// Listen for incoming call requests
		const onIncomingCall = (data: { from: string }) => {
			toast.info(`Incoming call from ${data.from}`);
			setPendingCalls((prev) => [...prev, { id: data.from, name: "User" }]);
		};

		// Listen for user count updates
		const onActiveUsers = (count: number) => {
			setActiveUsers(count);
		};

		socket.on("connect", goOnline);
		socket.on("incoming_call", onIncomingCall);
		socket.on("active_users_count", onActiveUsers);

		return () => {
			socket.off("connect", goOnline);
			socket.off("incoming_call", onIncomingCall);
			socket.off("active_users_count", onActiveUsers);
		};
	}, [socket, user]);

	if (!isAuthenticated || !user || user.role !== "instructor") {
		return null; // Will redirect in the effect
	}

	const handleAnswerCall = (userId: string) => {
		// Navigate to video call room
		router.push(`/instructor-chat/${user.id}?caller=${userId}`);

		// Remove from pending calls
		setPendingCalls((prev) => prev.filter((call) => call.id !== userId));
	};

	const handleIgnoreCall = (userId: string) => {
		// Remove from pending calls
		setPendingCalls((prev) => prev.filter((call) => call.id !== userId));
		toast.info("Call ignored");
	};

	const handleLogout = () => {
		// This will trigger the instructor_signout event through useAuth
		logout();
		router.push("/login");
	};

	return (
		<ProtectedRoute requireRole="instructor">
			<PageWrapper className="min-h-screen bg-background p-6 text-foreground">
			<div className="max-w-7xl mx-auto">
				<header className="flex items-center justify-between mb-8">
					<h1 className="text-3xl font-bold">
						Instructor Dashboard
					</h1>
					<div className="flex items-center gap-2">
						<span
							className={`inline-block w-3 h-3 rounded-full ${
								isConnected ? "bg-primary" : "bg-destructive"
							}`}
						></span>
						<span className="text-sm text-muted-foreground mr-4">
							{isConnected ? "Online" : "Connecting..."}
						</span>
						<Button
							variant="outline"
							size="sm"
							className="border-destructive/50 text-destructive hover:bg-destructive/10"
							onClick={handleLogout}
						>
							Sign Out
						</Button>
					</div>
				</header>

				<div className="flex flex-col lg:flex-row gap-6">
					{/* Instructor Profile */}
					<Card className="lg:w-1/3">
						<CardContent className="p-6">
							<div className="flex items-center mb-6">
								<Avatar className="mr-4 h-20 w-20">
									<AvatarImage
										src={user.profileImage || "/placeholder.svg"}
										alt={user.name}
									/>
									<AvatarFallback>
										{user.name
											.split(" ")
											.map((part) => part.charAt(0))
											.join("")}
									</AvatarFallback>
								</Avatar>
								<div>
									<h2 className="text-xl font-semibold">{user.name}</h2>
									<p className="text-primary font-medium">
										{user.specialty}
									</p>
								</div>
							</div>

							<div>
								<h3 className="font-medium mb-2">Biography</h3>
								<p className="text-muted-foreground">
									{user.biography || "No biography provided."}
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Active Calls & Stats */}
					<div className="lg:w-2/3 space-y-6">
						{/* Stats */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Card>
								<CardHeader className="p-5 pb-1">
									<CardDescription>Active Users</CardDescription>
									<CardTitle className="text-2xl">{activeUsers}</CardTitle>
								</CardHeader>
							</Card>

							<Card>
								<CardHeader className="p-5 pb-1">
									<CardDescription>Status</CardDescription>
									<CardTitle className="flex items-center text-2xl">
										<span
											className={`w-3 h-3 rounded-full mr-2 ${
												isConnected ? "bg-primary" : "bg-destructive"
											}`}
										></span>
										{isConnected ? "Online" : "Offline"}
									</CardTitle>
								</CardHeader>
							</Card>

							<Card>
								<CardHeader className="p-5 pb-1">
									<CardDescription>Pending Calls</CardDescription>
									<CardTitle className="text-2xl">
										{pendingCalls.length}
									</CardTitle>
								</CardHeader>
							</Card>
						</div>

						{/* Pending Calls */}
						<Card>
							<CardHeader>
								<CardTitle>Pending Call Requests</CardTitle>
							</CardHeader>
							<CardContent>
								{pendingCalls.length === 0 ? (
									<p className="text-muted-foreground">
										No pending call requests
									</p>
								) : (
									<div className="space-y-3">
										{pendingCalls.map((call) => (
											<div
												key={call.id}
												className="flex items-center justify-between bg-accent p-4 rounded-lg"
											>
												<div>
													<p className="font-medium">
														{call.name || "User"}
													</p>
													<p className="text-sm text-muted-foreground">
														ID: {call.id}
													</p>
												</div>
												<div className="flex gap-2">
													<Button
														variant="secondary"
														size="sm"
														onClick={() => handleAnswerCall(call.id)}
													>
														Answer
													</Button>
													<Button
														variant="destructive"
														size="sm"
														onClick={() => handleIgnoreCall(call.id)}
													>
														Ignore
													</Button>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Instructions */}
						<Card>
							<CardHeader>
								<CardTitle>Instructions</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="text-muted-foreground space-y-2 list-disc pl-5">
									<li>
										Your status is automatically set to online when you
										log in
									</li>
									<li>
										Users can see your availability status in real-time
									</li>
									<li>
										When a user initiates a call, you&apos;ll see a
										notification here
									</li>
									<li>
										You can answer calls to start a video consultation or
										ignore them
									</li>
									<li>
										Remember to sign out when you&apos;re not available
										for consultations
									</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
			</PageWrapper>
		</ProtectedRoute>
	);
}
