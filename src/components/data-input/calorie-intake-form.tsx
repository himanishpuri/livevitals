"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DataEntryForm } from "@/components/data-input/data-entry-form";

const formSchema = z.object({
	calories: z
		.number()
		.min(0, "Calories cannot be negative")
		.max(10000, "Calories too high"),
	protein: z.number().min(0, "Protein cannot be negative"),
	carbs: z.number().min(0, "Carbs cannot be negative"),
	fat: z.number().min(0, "Fat cannot be negative"),
});

interface CalorieIntakeFormProps {
	initialCalories: number;
	initialProtein: number;
	initialCarbs: number;
	initialFat: number;
	onSave: (data: {
		calories: number;
		protein: number;
		carbs: number;
		fat: number;
	}) => void;
	isSaving: boolean;
}

const macroFields = [
	{ name: "protein", label: "Protein" },
	{ name: "carbs", label: "Carbs" },
	{ name: "fat", label: "Fat" },
] as const;

export function CalorieIntakeForm({
	initialCalories,
	initialProtein,
	initialCarbs,
	initialFat,
	onSave,
	isSaving,
}: CalorieIntakeFormProps) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			calories: initialCalories,
			protein: initialProtein,
			carbs: initialCarbs,
			fat: initialFat,
		},
	});

	return (
		<DataEntryForm form={form} onSubmit={onSave}>
			<FormField
				control={form.control}
				name="calories"
				render={({ field }) => (
					<FormItem>
						<div className="space-y-1">
							<FormLabel>Daily Calorie Intake</FormLabel>
							<FormDescription>Total calories consumed today</FormDescription>
						</div>
						<div className="space-y-4 pt-2">
							<div className="flex items-center space-x-4">
								<FormControl>
									<Input
										type="number"
										placeholder="Enter calories"
										{...field}
										onChange={(e) => field.onChange(Number(e.target.value))}
									/>
								</FormControl>
								<span>kcal</span>
							</div>
						</div>
						<FormMessage />
					</FormItem>
				)}
			/>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{macroFields.map(({ name, label }) => (
					<FormField
						key={name}
						control={form.control}
						name={name}
						render={({ field }) => (
							<FormItem>
								<div className="space-y-1">
									<FormLabel>{label}</FormLabel>
								</div>
								<div className="flex items-center space-x-4">
									<FormControl>
										<Input
											type="number"
											placeholder="0"
											{...field}
											onChange={(e) => field.onChange(Number(e.target.value))}
										/>
									</FormControl>
									<span>g</span>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
				))}
			</div>

			<Button type="submit" className="w-full" disabled={isSaving}>
				{isSaving ? "Saving..." : "Save Calorie Data"}
			</Button>
		</DataEntryForm>
	);
}
