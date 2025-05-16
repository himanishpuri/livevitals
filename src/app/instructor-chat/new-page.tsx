"use client";
import { useEffect } from "react";
import useSocket from "@/hooks/useSocket";
import { InstructorList } from "@/components/instructor-chat/instructor-list";
import { Toaster, toast } from "sonner";

const InstructorChatPage = () => {
	const { instructors, isConnected } = useSocket();

	useEffect(() => {
		// Notify when connection status changes
		if (isConnected) {
			toast.success("Connected to instructor network");
		}
	}, [isConnected]);

	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
			<Toaster />
			<div className="max-w-5xl mx-auto">
				<div className="mb-8 text-center">
					<h1 className="text-3xl font-bold text-blue-800">
						Instructor Chat
					</h1>
					<p className="text-gray-600 mt-2">
						Choose an instructor to start a video consultation
					</p>
				</div>

				<div className="mb-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold text-gray-800">
							Available Instructors
						</h2>
						<div className="flex items-center">
							<span
								className={`inline-block w-2 h-2 rounded-full mr-2 ${
									isConnected ? "bg-green-500" : "bg-red-500"
								}`}
							></span>
							<span className="text-sm text-gray-600">
								{isConnected ? "Connected" : "Connecting..."}
							</span>
						</div>
					</div>

					<InstructorList instructors={instructors} />
				</div>

				<div className="bg-white rounded-xl shadow-sm p-4 mt-8">
					<h2 className="font-medium text-gray-800 mb-2">
						Video Consultation Guidelines
					</h2>
					<ul className="text-sm text-gray-600 space-y-2">
						<li>
							• Ensure your camera and microphone are working properly
							before starting a call
						</li>
						<li>
							• Find a quiet space with good lighting for the best
							experience
						</li>
						<li>
							• Prepare any questions or topics you&apos;d like to
							discuss in advance
						</li>
						<li>• Consultations are limited to 30 minutes per session</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default InstructorChatPage;
