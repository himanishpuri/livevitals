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
import {
	Video,
	Phone,
	MicOff,
	Mic,
	VideoOff,
	MessageSquare,
	Clock,
	Star,
	ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const InstructorVideoChat = () => {
	const router = useRouter();
	const params = useParams();
	const { socket } = useSocket();
	const { isAuthenticated } = useAuth();

	// Check if this is an instructor answering a call

	// Instructor ID from URL
	const instructorId = params?.id as string;
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
	const [activeTab, setActiveTab] = useState("video");
	const [audioEnabled, setAudioEnabled] = useState(true);
	const [videoEnabled, setVideoEnabled] = useState(true);
	const [authChecked, setAuthChecked] = useState(false);

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

	const toggleAudio = () => {
		if (localStreamRef.current) {
			const audioTracks = localStreamRef.current.getAudioTracks();
			audioTracks.forEach((track) => {
				track.enabled = !audioEnabled;
			});
			setAudioEnabled(!audioEnabled);
		}
	};

	const toggleVideo = () => {
		if (localStreamRef.current) {
			const videoTracks = localStreamRef.current.getVideoTracks();
			videoTracks.forEach((track) => {
				track.enabled = !videoEnabled;
			});
			setVideoEnabled(!videoEnabled);
		}
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

	// Check authentication
	useEffect(() => {
		if (isAuthenticated === undefined) return;

		if (!isAuthenticated) {
			toast.error("Please sign in to join a video consultation");
			setTimeout(() => router.push("/login"), 2000);
		}
		setAuthChecked(true);
	}, [isAuthenticated, router]);

	if (!instructor) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-6 flex items-center justify-center">
				<div className="text-center">
					<p className="text-lg">Instructor not found</p>
					<p className="text-muted-foreground mt-2">
						Redirecting to instructor list...
					</p>
				</div>
			</div>
		);
	}

	if (!authChecked) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-6 flex items-center justify-center">
				<Toaster />
				<div className="text-center">
					<p className="text-lg">Checking authentication...</p>
					<p className="text-muted-foreground mt-2">Please wait...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-6 flex items-center justify-center">
				<Toaster />
				<div className="text-center">
					<p className="text-lg">Authentication required</p>
					<p className="text-muted-foreground mt-2">
						Redirecting to login...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-6">
			<Toaster />
			<div className="max-w-6xl mx-auto">
				<div className="flex items-center gap-4 mb-8">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.push("/instructor-chat")}
						className="h-10 w-10"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>

					<h1 className="text-2xl font-bold">
						Session with {instructor.name}
					</h1>

					<Badge
						variant={instructor.availability ? "default" : "outline"}
						className="ml-auto"
					>
						{instructor.availability ? "Available" : "Offline"}
					</Badge>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left column - Instructor info */}
					<div className="lg:col-span-1">
						<Card className="mb-6">
							<CardHeader className="pb-2">
								<CardTitle>Instructor Profile</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-col items-center text-center mb-4">
									<div className="w-24 h-24 rounded-full overflow-hidden relative border-2 border-background shadow-sm mb-4">
										<Image
											src={
												instructor.profileImage ||
												"/placeholder.svg"
											}
											alt={instructor.name}
											width={96}
											height={96}
											className="object-cover"
											onError={(e) => {
												// Fallback for image loading errors
												const target = e.target as HTMLImageElement;
												target.src =
													"https://via.placeholder.com/100?text=" +
													instructor.name.charAt(0);
											}}
										/>
									</div>

									<h2 className="text-xl font-semibold">
										{instructor.name}
									</h2>
									<p className="text-primary text-sm font-medium mb-2">
										{instructor.specialty}
									</p>

									<div className="flex items-center gap-1 mb-4">
										{[1, 2, 3, 4, 5].map((star) => (
											<Star
												key={star}
												className="h-4 w-4 fill-yellow-400 text-yellow-400"
											/>
										))}
									</div>
								</div>

								<div className="space-y-4">
									<div>
										<h3 className="text-sm font-medium text-muted-foreground mb-1">
											About
										</h3>
										<p className="text-sm">{instructor.biography}</p>
									</div>

									<div className="flex items-center justify-between pt-4 border-t">
										<div className="flex items-center gap-1">
											<Clock className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm">30 min session</span>
										</div>

										<ScheduleSessionDialog instructor={instructor} />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-2">
								<CardTitle>Your ID</CardTitle>
								<CardDescription>
									For troubleshooting connection issues
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
									<code className="bg-transparent px-2 py-1 rounded flex-1 text-xs font-mono overflow-hidden text-ellipsis">
										{myPeerId}
									</code>
									<Button
										onClick={copyId}
										variant="outline"
										size="sm"
										className="text-xs h-8"
									>
										{copySuccess ? "Copied!" : "Copy"}
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right column - Video and chat */}
					<div className="lg:col-span-2">
						<Tabs
							value={activeTab}
							onValueChange={setActiveTab}
							className="mb-6"
						>
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger
									value="video"
									className="flex items-center gap-2"
								>
									<Video className="h-4 w-4" />
									<span>Video Call</span>
								</TabsTrigger>
								<TabsTrigger
									value="chat"
									className="flex items-center gap-2"
								>
									<MessageSquare className="h-4 w-4" />
									<span>Text Chat</span>
								</TabsTrigger>
							</TabsList>
						</Tabs>

						<AnimatePresence mode="wait">
							{activeTab === "video" ? (
								<motion.div
									key="video"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									<Card className="mb-6">
										<CardContent className="p-0 overflow-hidden">
											<div className="relative aspect-video bg-black rounded-lg overflow-hidden">
												{isConnected ? (
													<>
														{/* Instructor video (large) */}
														<video
															className="w-full h-full object-cover"
															playsInline
															ref={instructorVideoRef}
															autoPlay
														/>

														{/* Your video (small overlay) */}
														<div className="absolute bottom-4 right-4 w-1/4 aspect-video rounded-lg overflow-hidden border-2 border-background shadow-lg">
															<video
																className="w-full h-full object-cover scale-x-[-1]"
																playsInline
																ref={myVideoRef}
																autoPlay
																muted
															/>
														</div>
													</>
												) : (
													<div className="absolute inset-0 flex items-center justify-center">
														<div className="text-center">
															<div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-background shadow-lg">
																<Image
																	src={
																		instructor.profileImage ||
																		"/placeholder.svg"
																	}
																	alt={instructor.name}
																	width={96}
																	height={96}
																	className="object-cover"
																	onError={(e) => {
																		const target =
																			e.target as HTMLImageElement;
																		target.src =
																			"https://via.placeholder.com/100?text=" +
																			instructor.name.charAt(
																				0,
																			);
																	}}
																/>
															</div>
															{!isCalling ? (
																<p className="text-xl font-medium mb-2">
																	{instructor.name}
																</p>
															) : (
																<p className="text-xl font-medium mb-2 text-primary animate-pulse">
																	Calling...
																</p>
															)}
															<p className="text-muted-foreground">
																{instructor.specialty}
															</p>
														</div>
													</div>
												)}
											</div>

											{/* Video controls */}
											<div className="flex items-center justify-center gap-4 p-4">
												<Button
													variant="outline"
													size="icon"
													className="h-12 w-12 rounded-full"
													onClick={toggleAudio}
												>
													{audioEnabled ? (
														<Mic className="h-5 w-5" />
													) : (
														<MicOff className="h-5 w-5 text-destructive" />
													)}
												</Button>

												{isConnected ? (
													<Button
														variant="destructive"
														size="icon"
														className="h-14 w-14 rounded-full"
														onClick={endCall}
													>
														<Phone className="h-6 w-6 rotate-135" />
													</Button>
												) : (
													<Button
														variant="default"
														size="icon"
														className="h-14 w-14 rounded-full"
														onClick={initializeCall}
														disabled={
															isCalling ||
															!instructor.availability
														}
													>
														<Phone className="h-6 w-6" />
													</Button>
												)}

												<Button
													variant="outline"
													size="icon"
													className="h-12 w-12 rounded-full"
													onClick={toggleVideo}
												>
													{videoEnabled ? (
														<Video className="h-5 w-5" />
													) : (
														<VideoOff className="h-5 w-5 text-destructive" />
													)}
												</Button>
											</div>
										</CardContent>
									</Card>

									{/* Your video preview */}
									<Card>
										<CardHeader className="pb-2">
											<CardTitle>Your Camera</CardTitle>
											<CardDescription>
												Preview how you appear to others
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="rounded-lg overflow-hidden bg-black aspect-video">
												<video
													className="w-full h-full object-cover scale-x-[-1]"
													playsInline
													ref={myVideoRef}
													autoPlay
													muted
												/>
											</div>
										</CardContent>
									</Card>
								</motion.div>
							) : (
								<motion.div
									key="chat"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.2 }}
									className="h-[600px]"
								>
									<ChatComponent
										instructorId={instructorId}
										instructorName={instructor.name}
										instructorImage={instructor.profileImage}
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InstructorVideoChat;
