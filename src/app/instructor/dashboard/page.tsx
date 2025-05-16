"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Toaster, toast } from "sonner";
import useSocket from "@/hooks/useSocket";

export default function InstructorDashboard() {
	const { user, isAuthenticated, logout } = useAuth();
	const router = useRouter();
	const { socket, isConnected } = useSocket();
	const [activeUsers, setActiveUsers] = useState<number>(0);
	const [pendingCalls, setPendingCalls] = useState<
		{ id: string; name: string }[]
	>([]);

	useEffect(() => {
		// Redirect if not authenticated or not an instructor
		if (!isAuthenticated) {
			router.push("/login");
		} else if (user?.role !== "instructor") {
			router.push("/dashboard");
		}
	}, [isAuthenticated, user, router]);

	useEffect(() => {
		if (socket && user?.role === "instructor") {
			// Register as an online instructor
			socket.emit("instructor_signin", user.id);

			// Listen for incoming call requests
			socket.on("incoming_call", (data) => {
				toast.info(`Incoming call from ${data.from}`);
				setPendingCalls((prev) => [
					...prev,
					{ id: data.from, name: "User" },
				]);
			});

			// Listen for user count updates
			socket.on("active_users_count", (count) => {
				setActiveUsers(count);
			});

			return () => {
				socket.off("incoming_call");
				socket.off("active_users_count");
			};
		}
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
		<div className="text-black min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
			<Toaster />
			<div className="max-w-7xl mx-auto">
				<header className="flex items-center justify-between mb-8">
					<h1 className="text-3xl font-bold text-blue-800">
						Instructor Dashboard
					</h1>
					<div className="flex items-center gap-2">
						<span
							className={`inline-block w-3 h-3 rounded-full ${
								isConnected ? "bg-green-500" : "bg-red-500"
							}`}
						></span>
						<span className="text-sm text-gray-600 mr-4">
							{isConnected ? "Online" : "Connecting..."}
						</span>
						<button
							onClick={handleLogout}
							className="px-4 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
						>
							Sign Out
						</button>
					</div>
				</header>

				<div className="flex flex-col lg:flex-row gap-6">
					{/* Instructor Profile */}
					<div className="lg:w-1/3 bg-white rounded-xl shadow-md p-6">
						<div className="flex items-center mb-6">
							<div className="w-20 h-20 rounded-full overflow-hidden mr-4">
								<Image
									src={user.profileImage || "/instructors/male.jpg"}
									alt={user.name}
									width={80}
									height={80}
									className="object-cover"
									onError={(e) => {
										const target = e.target as HTMLImageElement;
										target.src =
											"https://via.placeholder.com/100?text=" +
											user.name.charAt(0);
									}}
								/>
							</div>
							<div>
								<h2 className="text-xl font-semibold">{user.name}</h2>
								<p className="text-green-600 font-medium">
									{user.specialty}
								</p>
							</div>
						</div>

						<div>
							<h3 className="font-medium mb-2">Biography</h3>
							<p className="text-gray-600">
								{user.biography || "No biography provided."}
							</p>
						</div>
					</div>

					{/* Active Calls & Stats */}
					<div className="lg:w-2/3 space-y-6">
						{/* Stats */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-white rounded-xl shadow-md p-5">
								<h3 className="text-sm text-gray-500 mb-1">
									Active Users
								</h3>
								<p className="text-2xl font-medium">{activeUsers}</p>
							</div>

							<div className="bg-white rounded-xl shadow-md p-5">
								<h3 className="text-sm text-gray-500 mb-1">Status</h3>
								<p className="text-2xl font-medium flex items-center">
									<span
										className={`w-3 h-3 rounded-full mr-2 ${
											isConnected ? "bg-green-500" : "bg-red-500"
										}`}
									></span>
									{isConnected ? "Online" : "Offline"}
								</p>
							</div>

							<div className="bg-white rounded-xl shadow-md p-5">
								<h3 className="text-sm text-gray-500 mb-1">
									Pending Calls
								</h3>
								<p className="text-2xl font-medium">
									{pendingCalls.length}
								</p>
							</div>
						</div>

						{/* Pending Calls */}
						<div className="bg-white rounded-xl shadow-md p-6">
							<h2 className="text-xl font-semibold mb-4">
								Pending Call Requests
							</h2>

							{pendingCalls.length === 0 ? (
								<p className="text-gray-500">
									No pending call requests
								</p>
							) : (
								<div className="space-y-3">
									{pendingCalls.map((call) => (
										<div
											key={call.id}
											className="flex items-center justify-between bg-blue-50 p-4 rounded-lg"
										>
											<div>
												<p className="font-medium">
													{call.name || "User"}
												</p>
												<p className="text-sm text-gray-500">
													ID: {call.id}
												</p>
											</div>
											<div className="flex gap-2">
												<button
													onClick={() => handleAnswerCall(call.id)}
													className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
												>
													Answer
												</button>
												<button
													onClick={() => handleIgnoreCall(call.id)}
													className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
												>
													Ignore
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Instructions */}
						<div className="bg-white rounded-xl shadow-md p-6">
							<h2 className="text-xl font-semibold mb-2">
								Instructions
							</h2>
							<ul className="text-gray-600 space-y-2 list-disc pl-5">
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
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
