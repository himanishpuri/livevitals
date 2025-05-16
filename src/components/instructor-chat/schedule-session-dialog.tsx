"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Instructor } from "@/data/instructors";

// Form schema for scheduling a session
const scheduleFormSchema = z.object({
	date: z.date({
		required_error: "Please select a date",
	}),
	timeSlot: z.string({
		required_error: "Please select a time slot",
	}),
	sessionType: z.string({
		required_error: "Please select a session type",
	}),
	notes: z.string().optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface ScheduleSessionProps {
	instructor: Instructor;
	onSchedule?: (
		sessionDetails: ScheduleFormValues & { instructorId: string },
	) => void;
}

export function ScheduleSessionDialog({
	instructor,
	onSchedule,
}: ScheduleSessionProps) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Available time slots (these could be fetched from an API based on instructor availability)
	const timeSlots = [
		"08:00 AM - 08:30 AM",
		"09:00 AM - 09:30 AM",
		"10:00 AM - 10:30 AM",
		"11:00 AM - 11:30 AM",
		"01:00 PM - 01:30 PM",
		"02:00 PM - 02:30 PM",
		"03:00 PM - 03:30 PM",
		"04:00 PM - 04:30 PM",
		"05:00 PM - 05:30 PM",
	];

	// Session types
	const sessionTypes = [
		"Initial Consultation",
		"Workout Planning",
		"Nutrition Guidance",
		"Progress Review",
		"Technique Assessment",
		"General Fitness Discussion",
	];

	const form = useForm<ScheduleFormValues>({
		resolver: zodResolver(scheduleFormSchema),
		defaultValues: {
			date: addDays(new Date(), 1), // Default to tomorrow
			notes: "",
		},
	});

	function onSubmit(data: ScheduleFormValues) {
		setIsSubmitting(true);

		// In a real app, this would call an API to schedule the session
		// For now, we'll simulate an API call and show a success message
		setTimeout(() => {
			if (onSchedule) {
				onSchedule({
					...data,
					instructorId: instructor.id,
				});
			}

			toast.success(`Session scheduled with ${instructor.name}!`, {
				description: `${format(data.date, "EEEE, MMMM d, yyyy")} at ${
					data.timeSlot
				}`,
			});

			setIsSubmitting(false);
			setOpen(false);
			form.reset();
		}, 1000);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button variant="outline">Schedule a Session</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>
						Schedule a Session with {instructor.name}
					</DialogTitle>
					<DialogDescription>
						Choose a date and time that works for you. Your session will
						be confirmed upon submission.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Date</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant={"outline"}
													className={cn(
														"pl-3 text-left font-normal",
														!field.value &&
															"text-muted-foreground",
													)}
												>
													{field.value ? (
														format(field.value, "PPP")
													) : (
														<span>Pick a date</span>
													)}
													<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent
											className="w-auto p-0"
											align="start"
										>
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={field.onChange}
												disabled={(date) =>
													// Disable dates in the past and more than 30 days in the future
													date < new Date() ||
													date > addDays(new Date(), 30)
												}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
									<FormDescription>
										Select a date within the next 30 days
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="timeSlot"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Time Slot</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select a time slot" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{timeSlots.map((slot) => (
												<SelectItem
													key={slot}
													value={slot}
												>
													<div className="flex items-center">
														<Clock className="mr-2 h-4 w-4" />
														<span>{slot}</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>
										All sessions are 30 minutes long
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="sessionType"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Session Type</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select session type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{sessionTypes.map((type) => (
												<SelectItem
													key={type}
													value={type}
												>
													{type}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes (Optional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Any specific topics you'd like to discuss or questions you have for the instructor"
											className="min-h-[80px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="submit"
								className="w-full"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Scheduling..." : "Schedule Session"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
