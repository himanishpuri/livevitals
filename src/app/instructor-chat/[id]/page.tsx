"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { toast, Toaster } from "sonner";
import useSocket from "@/hooks/useSocket";
import Peer, { type MediaConnection } from "peerjs";
import { instructors } from "@/data/instructors";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { ScheduleSessionDialog } from "@/components/instructor-chat/schedule-session-dialog";
import { ChatComponent } from "@/components/instructor-chat/chat-component";

const InstructorVideoChat = () => {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const { socket } = useSocket();
	const { user, isAuthenticated } = useAuth();

	// Check if this is an instructor answering a call
	const callerParam = searchParams.get("caller");
	const isInstructorAnswering = user?.role === "instructor" && callerParam;

	// Instructor ID from URL
	const instructorId = params.id as string;
	const instructor = instructors.find((ins) => ins.id === instructorId);

	// Video chat refs
	const myVideoRef = useRef<HTMLVideoElement>(null);
	const instructorVideoRef = useRef<HTMLVideoElement>(null);
	const currentCallRef = useRef<MediaConnection | null>(null);
	const localStreamRef = useRef<MediaStream | null>(null);

	// States
	const [myPeerId, setMyPeerId] = useState<string>("");
	const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
	const [isCalling, setIsCalling] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [copySuccess, setCopySuccess] = useState(false);

	const generateId = () => crypto.randomUUID();

	const initializeCall = () => {
		if (!instructor?.availability) {
			toast.error(
				`${instructor?.name ?? "Instructor"} is currently offline`,
			);
			return;
		}

		setIsCalling(true);

		navigator.mediaDevices
			.getUserMedia({
				video: true,
				audio: true,
			})
			.then((stream) => {
				localStreamRef.current = stream;

				// Notify server about call intent
				socket?.emit("initiate_call", {
					from: myPeerId,
					to: instructorId,
				});

				// Wait for instructor to connect
				toast.info(`Calling ${instructor.name}...`);
			})
			.catch((err) => {
				console.error("Error accessing media devices:", err);
				setIsCalling(false);
				toast.error("Could not access camera or microphone");
			});
	};

	const endCall = () => {
		// Close the current call if it exists
		if (currentCallRef.current) {
			currentCallRef.current.close();
			currentCallRef.current = null;
		}

		// Clear the remote video
		if (instructorVideoRef.current) {
			instructorVideoRef.current.srcObject = null;
		}

		setIsCalling(false);
		setIsConnected(false);
	};

	const copyId = () => {
		navigator.clipboard.writeText(myPeerId);
		setCopySuccess(true);
		setTimeout(() => setCopySuccess(false), 2000);
	};

	// Initialize peer connection
	useEffect(() => {
		const newPeerId = generateId();
		setMyPeerId(newPeerId);

		if (typeof window !== "undefined") {
			const peer = new Peer(newPeerId, {
				host: "localhost",
				port: 9000,
				path: "/myapp",
			});

			setPeerInstance(peer);

			// Get local video feed
			navigator.mediaDevices
				.getUserMedia({
					video: true,
					audio: true,
				})
				.then((stream) => {
					localStreamRef.current = stream;
					if (myVideoRef.current) {
						myVideoRef.current.srcObject = stream;
					}

					// Handle incoming calls
					peer.on("call", (call) => {
						currentCallRef.current = call;
						call.answer(stream);
						setIsCalling(true);

						call.on("stream", (instructorStream) => {
							if (instructorVideoRef.current) {
								instructorVideoRef.current.srcObject = instructorStream;
								setIsConnected(true);
								toast.success(
									`Connected with ${instructor?.name || "instructor"}`,
								);
							}
						});

						call.on("close", () => {
							endCall();
							toast.info("Call ended");
						});
					});
				});

			// Handle connection errors
			peer.on("error", (err) => {
				console.error("PeerJS error:", err);
				toast.error("Connection error. Please try again.");
				endCall();
			});

			// Clean up on unmount
			return () => {
				if (localStreamRef.current) {
					localStreamRef.current
						.getTracks()
						.forEach((track) => track.stop());
				}
				peer.destroy();
			};
		}
	}, [instructorId]);

	// Handle call_failed event from server
	useEffect(() => {
		if (socket) {
			socket.on("call_failed", ({ reason }) => {
				toast.error(reason || "Call failed");
				setIsCalling(false);
			});

			// Clean up event listener
			return () => {
				socket.off("call_failed");
			};
		}
	}, [socket]);

	// Check instructor availability when page loads
	useEffect(() => {
		if (!instructor) {
			toast.error("Instructor not found");
			setTimeout(() => router.push("/instructor-chat"), 2000);
			return;
		}

		if (instructor && !instructor.availability) {
			toast.warning(`${instructor.name} is currently offline`);
		}
	}, [instructor, router]);

	if (!instructor) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex items-center justify-center">
				<div className="text-center">
					<p className="text-lg text-gray-600">Instructor not found</p>
					<p className="text-gray-500 mt-2">
						Redirecting to instructor list...
					</p>
				</div>
			</div>
		);
	}
	// Check authentication
	useEffect(() => {
		if (!isAuthenticated) {
			toast.error("Please sign in to join a video consultation");
			setTimeout(() => router.push("/login"), 2000);
		}
	}, [isAuthenticated, router]);

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex items-center justify-center">
				<Toaster />
				<div className="text-center">
					<p className="text-lg text-gray-600">Authentication required</p>
					<p className="text-gray-500 mt-2">Redirecting to login...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
			<Toaster />
			<div className="max-w-5xl mx-auto">
				<div className="flex items-center gap-4 mb-6">
					<button
						onClick={() => router.push("/instructor-chat")}
						className="text-blue-600 hover:text-blue-800"
					>
						← Back to instructors
					</button>

					<h1 className="text-2xl font-bold text-blue-800">
						Video Chat with {instructor.name}
					</h1>
				</div>

				<div className="flex flex-col lg:flex-row gap-8">
					{/* Your video */}
					<div className="flex-1 bg-white rounded-xl shadow-md p-6 flex flex-col">
						<h2 className="text-xl font-semibold text-gray-800 mb-2">
							Your Camera
						</h2>

						<div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video mb-4">
							<video
								className="w-full h-full object-cover scale-x-[-1]"
								playsInline
								ref={myVideoRef}
								autoPlay
								muted
							/>
						</div>

						<div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg mb-4">
							<span className="text-sm text-gray-600">Your ID: </span>
							<code className="bg-white px-2 py-1 rounded flex-1 text-blue-800 text-sm font-mono overflow-hidden text-ellipsis">
								{myPeerId}
							</code>
							<button
								onClick={copyId}
								className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded transition-all"
							>
								{copySuccess ? "Copied!" : "Copy"}
							</button>
						</div>
					</div>

					{/* Instructor video */}
					<div className="flex-1 bg-white rounded-xl shadow-md p-6 flex flex-col">
						<div className="flex items-center justify-between mb-2">
							<h2 className="text-xl font-semibold text-gray-800">
								{instructor.name}
							</h2>
							<span
								className={`inline-block px-2 py-1 rounded-full text-xs ${
									instructor.availability
										? "bg-green-100 text-green-800"
										: "bg-gray-100 text-gray-800"
								}`}
							>
								{instructor.availability ? "Available" : "Offline"}
							</span>
						</div>
						<div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video mb-4">
							{isConnected ? (
								<video
									className="w-full h-full object-cover"
									playsInline
									ref={instructorVideoRef}
									autoPlay
								/>
							) : (
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="text-center">
										<div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-2 border-white shadow-sm">
											<Image
												src={instructor.profileImage}
												alt={instructor.name}
												width={80}
												height={80}
												className="object-cover"
												onError={(e) => {
													// Fallback for image loading errors
													const target =
														e.target as HTMLImageElement;
													target.src =
														"https://via.placeholder.com/100?text=" +
														instructor.name.charAt(0);
												}}
											/>
										</div>
										{!isCalling ? (
											<p className="text-gray-500">
												{instructor.specialty}
											</p>
										) : (
											<p className="text-blue-600">Calling...</p>
										)}
									</div>
								</div>
							)}
						</div>
						<div className="flex gap-2 mt-2">
							{isConnected ? (
								<button
									onClick={endCall}
									className="w-full px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-all"
								>
									End Call
								</button>
							) : (
								<button
									onClick={initializeCall}
									disabled={isCalling || !instructor.availability}
									className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
										!instructor.availability
											? "bg-gray-300 text-gray-600 cursor-not-allowed"
											: isCalling
											? "bg-blue-400 text-white"
											: "bg-blue-600 hover:bg-blue-700 text-white"
									}`}
								>
									{isCalling ? "Connecting..." : "Start Call"}
								</button>
							)}
						</div>{" "}
						<div className="mt-4">
							<h3 className="font-medium mb-1">About</h3>
							<p className="text-sm text-gray-600">
								{instructor.biography}
							</p>
						</div>
						<div className="mt-6 border-t pt-4">
							<div className="flex items-center justify-between">
								<h3 className="font-medium">Can't talk now?</h3>
								<ScheduleSessionDialog instructor={instructor} />
							</div>
							<p className="text-sm text-gray-600 mt-1">
								Schedule a future session with {instructor.name}
							</p>
						</div>
					</div>
				</div>
				{/* Chat and Schedule Section */}
				<div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Text Chat */}
					<div className="bg-white rounded-xl shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-800 mb-4">
							Message {instructor.name}
						</h2>
						<div className="h-96">
							<ChatComponent
								instructorId={instructorId}
								instructorName={instructor.name}
								instructorImage={instructor.profileImage}
							/>
						</div>
					</div>

					{/* Scheduled Sessions Section */}
					<div className="bg-white rounded-xl shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-800 mb-4">
							Your Scheduled Sessions
						</h2>
						<div className="text-center py-6 text-gray-500">
							<p>No upcoming sessions scheduled</p>
							<p className="text-sm mt-2">
								Schedule a session with {instructor.name} to get started
							</p>
						</div>
					</div>
				</div>

				{/* Chat Component */}
				<div className="mt-8 bg-white rounded-xl shadow-md p-6">
					<h2 className="text-xl font-semibold text-gray-800 mb-4">
						Chat
					</h2>
					<ChatComponent instructorId={instructorId} />
				</div>
			</div>
		</div>
	);
};

export default InstructorVideoChat;
