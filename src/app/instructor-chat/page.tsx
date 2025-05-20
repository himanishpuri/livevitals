"use client";
import { useEffect } from "react";
import useSocket from "@/hooks/useSocket";
import { InstructorList } from "@/components/instructor-chat/instructor-list";
import { Toaster, toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import {
	Activity,
	Users,
	Video,
	CheckCircle2,
	AlertCircle,
	Info,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const InstructorChatPage = () => {
	const { instructors, isConnected } = useSocket();
	const { isAuthenticated } = useAuth();

	useEffect(() => {
		// Notify when connection status changes
		if (isConnected) {
			toast.success("Connected to instructor network");
		}
	}, [isConnected]);

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-6">
			<Toaster />
			<div className="max-w-6xl mx-auto">
				<div className="mb-10 text-center">
					<div className="flex justify-center mb-4">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
							<Video className="h-8 w-8 text-primary" />
						</div>
					</div>
					<h1 className="text-4xl font-bold mb-2">Instructor Chat</h1>
					<p className="text-muted-foreground text-lg max-w-xl mx-auto">
						Connect with fitness experts through secure video
						consultations for personalized guidance
					</p>
				</div>

				<div className="mb-8">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-2">
							<Users className="h-5 w-5 text-primary" />
							<h2 className="text-2xl font-semibold">
								Available Instructors
							</h2>
						</div>
						<div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border">
							<span
								className={`inline-block w-2.5 h-2.5 rounded-full ${
									isConnected ? "bg-green-500" : "bg-red-500"
								}`}
							></span>
							<span className="text-sm font-medium">
								{isConnected ? "Connected" : "Connecting..."}
							</span>
						</div>
					</div>

					{!isAuthenticated ? (
						<Alert
							variant="destructive"
							className="mb-6"
						>
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Authentication Required</AlertTitle>
							<AlertDescription>
								Please sign in to start a consultation with an
								instructor.
							</AlertDescription>
						</Alert>
					) : !isConnected ? (
						<Alert className="mb-6">
							<Info className="h-4 w-4" />
							<AlertTitle>Connecting to network</AlertTitle>
							<AlertDescription>
								Please wait while we connect you to our instructor
								network.
							</AlertDescription>
						</Alert>
					) : null}

					<InstructorList instructors={instructors} />
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Video className="h-5 w-5 text-primary" />
								Video Consultation Guidelines
							</CardTitle>
							<CardDescription>
								Follow these tips for the best consultation experience
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3">
								<li className="flex items-start gap-2">
									<CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span>
										Ensure your camera and microphone are working
										properly before starting
									</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span>
										Find a quiet space with good lighting for the best
										experience
									</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span>
										Prepare any questions or topics you&apos;d like to
										discuss in advance
									</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span>
										Consultations are limited to 30 minutes per
										session
									</span>
								</li>
							</ul>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Activity className="h-5 w-5 text-primary" />
								Benefits of Video Consultations
							</CardTitle>
							<CardDescription>
								Why our users love video consultations
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3">
								<li className="flex items-start gap-2">
									<CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span>
										Get personalized advice tailored to your specific
										needs
									</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span>
										Save time with convenient consultations from
										anywhere
									</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span>
										Access to expert instructors with specialized
										knowledge
									</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span>
										Follow-up sessions to track your progress over
										time
									</span>
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default InstructorChatPage;
