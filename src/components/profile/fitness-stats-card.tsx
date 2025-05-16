"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Save, TrendingUp, Activity } from "lucide-react";

// Schema for the fitness stats form
const fitnessStatsSchema = z.object({
	height: z.string().min(1, "Please enter your height"),
	weight: z.string().min(1, "Please enter your weight"),
	restingHeartRate: z.string().regex(/^\d+$/, "Please enter a valid number"),
	fitnessLevel: z.string(),
	preferredWorkoutTime: z.string(),
	workoutsPerWeek: z.string().regex(/^\d+$/, "Please enter a valid number"),
});

interface FitnessStatsCardProps {
	initialStats?: {
		height: string;
		weight: string;
		restingHeartRate: string;
		fitnessLevel: string;
		preferredWorkoutTime: string;
		workoutsPerWeek: string;
	};
}

export function FitnessStatsCard({
	initialStats = {
		height: "",
		weight: "",
		restingHeartRate: "70",
		fitnessLevel: "intermediate",
		preferredWorkoutTime: "morning",
		workoutsPerWeek: "3",
	},
}: FitnessStatsCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [currentStats, setCurrentStats] = useState(initialStats);

	const form = useForm<z.infer<typeof fitnessStatsSchema>>({
		resolver: zodResolver(fitnessStatsSchema),
		defaultValues: initialStats,
	});

	function onSubmit(data: z.infer<typeof fitnessStatsSchema>) {
		// In a real app, you would save this data to your backend
		setCurrentStats(data);
		setIsEditing(false);
		toast.success("Fitness stats updated successfully!");
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<Activity className="h-5 w-5 text-primary" />
						<CardTitle>Fitness Stats</CardTitle>
					</div>
					{!isEditing && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsEditing(true)}
						>
							<Edit className="h-4 w-4 mr-1" />
							Edit
						</Button>
					)}
				</div>
				<CardDescription>
					Track your fitness metrics and workout preferences
				</CardDescription>
			</CardHeader>

			<CardContent>
				{isEditing ? (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4"
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="height"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Height</FormLabel>
											<FormControl>
												<Input
													placeholder={"e.g., 5'10\" or 178cm"}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="weight"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Weight</FormLabel>
											<FormControl>
												<Input
													placeholder="e.g., 160lbs or 73kg"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="restingHeartRate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Resting Heart Rate (BPM)</FormLabel>
											<FormControl>
												<Input
													type="number"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="workoutsPerWeek"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Workouts Per Week</FormLabel>
											<FormControl>
												<Input
													type="number"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="fitnessLevel"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Fitness Level</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select your fitness level" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="beginner">
														Beginner
													</SelectItem>
													<SelectItem value="intermediate">
														Intermediate
													</SelectItem>
													<SelectItem value="advanced">
														Advanced
													</SelectItem>
													<SelectItem value="elite">
														Elite
													</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="preferredWorkoutTime"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Preferred Workout Time</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select preferred time" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="early_morning">
														Early Morning (5-7am)
													</SelectItem>
													<SelectItem value="morning">
														Morning (7-11am)
													</SelectItem>
													<SelectItem value="afternoon">
														Afternoon (11am-4pm)
													</SelectItem>
													<SelectItem value="evening">
														Evening (4-8pm)
													</SelectItem>
													<SelectItem value="night">
														Night (8pm+)
													</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="flex justify-end space-x-2">
								<Button
									variant="outline"
									type="button"
									onClick={() => setIsEditing(false)}
								>
									Cancel
								</Button>
								<Button type="submit">
									<Save className="h-4 w-4 mr-1" />
									Save
								</Button>
							</div>
						</form>
					</Form>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
						<div>
							<h4 className="text-sm font-medium text-muted-foreground">
								Height
							</h4>
							<p>{currentStats.height || "Not set"}</p>
						</div>
						<div>
							<h4 className="text-sm font-medium text-muted-foreground">
								Weight
							</h4>
							<p>{currentStats.weight || "Not set"}</p>
						</div>
						<div>
							<h4 className="text-sm font-medium text-muted-foreground">
								Resting Heart Rate
							</h4>
							<p>{currentStats.restingHeartRate || "Not set"} BPM</p>
						</div>
						<div>
							<h4 className="text-sm font-medium text-muted-foreground">
								Workouts Per Week
							</h4>
							<p>{currentStats.workoutsPerWeek || "Not set"}</p>
						</div>
						<div>
							<h4 className="text-sm font-medium text-muted-foreground">
								Fitness Level
							</h4>
							<p className="capitalize">
								{currentStats.fitnessLevel || "Not set"}
							</p>
						</div>
						<div>
							<h4 className="text-sm font-medium text-muted-foreground">
								Preferred Workout Time
							</h4>
							<p className="capitalize">
								{currentStats.preferredWorkoutTime.replace("_", " ") ||
									"Not set"}
							</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
