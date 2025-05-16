"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { format, addDays, isPast, parseISO, differenceInDays } from "date-fns";
import Image from "next/image";
import PageWrapper from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { instructors } from "@/data/instructors";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Calendar,
	Clock,
	Video,
	ChevronRight,
	Calendar as CalendarIcon,
} from "lucide-react";

// Mock data for scheduled sessions - in a real app, this would come from the backend
const mockScheduledSessions = [
	{
		id: "session-1",
		instructorId: "john-smith",
		date: addDays(new Date(), 2).toISOString(),
		timeSlot: "10:00 AM - 10:30 AM",
		sessionType: "Initial Consultation",
		notes: "Discuss nutrition plan and fitness goals",
		status: "upcoming",
	},
	{
		id: "session-2",
		instructorId: "sarah-johnson",
		date: addDays(new Date(), 5).toISOString(),
		timeSlot: "02:00 PM - 02:30 PM",
		sessionType: "Workout Planning",
		notes: "",
		status: "upcoming",
	},
	{
		id: "session-3",
		instructorId: "john-smith",
		date: addDays(new Date(), -5).toISOString(),
		timeSlot: "09:00 AM - 09:30 AM",
		sessionType: "Nutrition Guidance",
		notes: "Discussed meal planning and protein intake",
		status: "completed",
	},
];

export default function SchedulePage() {
	const { user, isAuthenticated } = useAuth();
	const router = useRouter();
	const [scheduledSessions, setScheduledSessions] = useState(
		mockScheduledSessions,
	);

	useEffect(() => {
		// Redirect if not logged in
		if (!isAuthenticated) {
			router.push("/login");
		}
	}, [isAuthenticated, router]);

	// Filter sessions by status
	const upcomingSessions = scheduledSessions.filter(
		(session) =>
			!isPast(parseISO(session.date)) || session.status === "upcoming",
	);

	const pastSessions = scheduledSessions.filter(
		(session) =>
			isPast(parseISO(session.date)) && session.status === "completed",
	);

	const getInstructorById = (id: string) => {
		return instructors.find((instructor) => instructor.id === id);
	};

	const cancelSession = (sessionId: string) => {
		// In a real app, this would call an API to cancel the session
		setScheduledSessions((prev) =>
			prev.filter((session) => session.id !== sessionId),
		);
	};

	const joinSession = (sessionId: string, instructorId: string) => {
		// Navigate to the video chat room with the instructor
		router.push(`/instructor-chat/${instructorId}`);
	};

	if (!isAuthenticated) return null;

	return (
		<PageWrapper>
			<div className="container mx-auto py-10 px-4">
				<h1 className="text-3xl font-bold mb-6">Your Scheduled Sessions</h1>

				<Tabs
					defaultValue="upcoming"
					className="w-full"
				>
					<TabsList className="mb-6">
						<TabsTrigger value="upcoming">
							<Calendar className="h-4 w-4 mr-2" />
							Upcoming Sessions
						</TabsTrigger>
						<TabsTrigger value="past">
							<Clock className="h-4 w-4 mr-2" />
							Past Sessions
						</TabsTrigger>
					</TabsList>

					<TabsContent value="upcoming">
						{upcomingSessions.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{upcomingSessions.map((session) => {
									const instructor = getInstructorById(
										session.instructorId,
									);
									if (!instructor) return null;

									const sessionDate = parseISO(session.date);
									const daysUntil = differenceInDays(
										sessionDate,
										new Date(),
									);
									const isToday = daysUntil === 0;
									const isSoon = daysUntil <= 1; // Today or tomorrow

									return (
										<Card
											key={session.id}
											className={`shadow-sm ${
												isSoon ? "border-primary/50" : ""
											}`}
										>
											<CardHeader className="pb-4">
												<div className="flex justify-between items-start">
													<div>
														<CardTitle className="text-lg">
															{session.sessionType}
														</CardTitle>
														<CardDescription>
															with {instructor?.name}
														</CardDescription>
													</div>
													<div className="flex items-center">
														{isToday && (
															<div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
																Today
															</div>
														)}
													</div>
												</div>
											</CardHeader>

											<CardContent>
												<div className="flex mb-4">
													<div className="w-12 h-12 rounded-full overflow-hidden mr-3">
														<Image
															src={
																instructor?.profileImage ||
																"/placeholder.svg"
															}
															alt={instructor?.name || ""}
															width={48}
															height={48}
															className="object-cover"
														/>
													</div>
													<div>
														<div className="text-sm font-medium">
															{instructor?.name}
														</div>
														<div className="text-xs text-muted-foreground">
															{instructor?.specialty}
														</div>
													</div>
												</div>

												<div className="space-y-2">
													<div className="flex items-center text-sm">
														<CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
														{format(
															parseISO(session.date),
															"EEEE, MMMM d, yyyy",
														)}
													</div>
													<div className="flex items-center text-sm">
														<Clock className="h-4 w-4 mr-2 text-muted-foreground" />
														{session.timeSlot}
													</div>
													{session.notes && (
														<div className="text-sm mt-2 bg-muted/20 p-2 rounded">
															{session.notes}
														</div>
													)}
												</div>
											</CardContent>

											<CardFooter className="flex justify-between">
												<Button
													variant="outline"
													size="sm"
													onClick={() => cancelSession(session.id)}
												>
													Cancel
												</Button>

												{isToday && (
													<Button
														size="sm"
														onClick={() =>
															joinSession(
																session.id,
																session.instructorId,
															)
														}
													>
														<Video className="h-4 w-4 mr-1" />{" "}
														Join Now
													</Button>
												)}
											</CardFooter>
										</Card>
									);
								})}
							</div>
						) : (
							<div className="text-center py-12 bg-muted/20 rounded-lg">
								<CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground" />
								<h3 className="mt-4 text-xl font-medium">
									No upcoming sessions
								</h3>
								<p className="text-muted-foreground mt-2">
									Schedule a session with an instructor to get started
								</p>
								<Button
									onClick={() => router.push("/instructor-chat")}
									className="mt-4"
								>
									Find an Instructor
								</Button>
							</div>
						)}
					</TabsContent>

					<TabsContent value="past">
						{pastSessions.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{pastSessions.map((session) => {
									const instructor = getInstructorById(
										session.instructorId,
									);
									if (!instructor) return null;

									return (
										<Card
											key={session.id}
											className="shadow-sm opacity-80"
										>
											<CardHeader className="pb-4">
												<CardTitle className="text-lg">
													{session.sessionType}
												</CardTitle>
												<CardDescription>
													with {instructor?.name}
												</CardDescription>
											</CardHeader>

											<CardContent>
												<div className="space-y-2">
													<div className="flex items-center text-sm">
														<CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
														{format(
															parseISO(session.date),
															"EEEE, MMMM d, yyyy",
														)}
													</div>
													<div className="flex items-center text-sm">
														<Clock className="h-4 w-4 mr-2 text-muted-foreground" />
														{session.timeSlot}
													</div>
													{session.notes && (
														<div className="text-sm mt-2 bg-muted/20 p-2 rounded">
															{session.notes}
														</div>
													)}
												</div>
											</CardContent>

											<CardFooter>
												<Button
													variant="outline"
													size="sm"
													className="w-full"
													onClick={() =>
														router.push(
															`/instructor-chat/${session.instructorId}`,
														)
													}
												>
													Schedule Another Session
													<ChevronRight className="h-4 w-4 ml-1" />
												</Button>
											</CardFooter>
										</Card>
									);
								})}
							</div>
						) : (
							<div className="text-center py-12 bg-muted/20 rounded-lg">
								<Clock className="h-12 w-12 mx-auto text-muted-foreground" />
								<h3 className="mt-4 text-xl font-medium">
									No past sessions
								</h3>
								<p className="text-muted-foreground mt-2">
									Your completed sessions will appear here
								</p>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</PageWrapper>
	);
}
