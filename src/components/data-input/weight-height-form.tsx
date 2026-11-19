"use client";
import { motion } from "motion/react";
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
import { Slider } from "@/components/ui/slider";
import { DataEntryForm } from "@/components/data-input/data-entry-form";

const formSchema = z.object({
	weight: z
		.number()
		.min(30, "Weight must be at least 30kg")
		.max(300, "Weight must be less than 300kg"),
	height: z
		.number()
		.min(100, "Height must be at least 100cm")
		.max(250, "Height must be less than 250cm"),
});

interface WeightHeightFormProps {
	initialWeight: number;
	initialHeight: number;
	onSave: (data: { weight: number; height: number }) => void;
	isSaving: boolean;
}

const measurementSliders = [
	{
		name: "weight",
		label: "Weight (kg)",
		description: "Drag the slider to set your current weight",
		min: 30,
		max: 150,
		step: 0.1,
		format: (value: number) => `${value.toFixed(1)} kg`,
	},
	{
		name: "height",
		label: "Height (cm)",
		description: "Enter your current height in centimeters",
		min: 100,
		max: 220,
		step: 1,
		format: (value: number) => `${value} cm`,
	},
] as const;

export function WeightHeightForm({
	initialWeight,
	initialHeight,
	onSave,
	isSaving,
}: Readonly<WeightHeightFormProps>) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			weight: initialWeight,
			height: initialHeight,
		},
	});

	return (
		<DataEntryForm
			form={form}
			onSubmit={onSave}
		>
			{measurementSliders.map(
				({ name, label, description, min, max, step, format }) => (
					<FormField
						key={name}
						control={form.control}
						name={name}
						render={({ field }) => (
							<FormItem>
								<div className="space-y-1">
									<FormLabel>{label}</FormLabel>
									<FormDescription>{description}</FormDescription>
								</div>
								<div className="space-y-4 pt-4">
									<FormControl>
										<Slider
											defaultValue={[field.value]}
											min={min}
											max={max}
											step={step}
											onValueChange={(vals) => {
												field.onChange(vals[0]);
											}}
										/>
									</FormControl>
									<motion.div
										key={field.value}
										initial={{ scale: 0.8, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										className="mx-auto text-center font-medium text-2xl"
									>
										{format(field.value)}
									</motion.div>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
				),
			)}

			<Button
				type="submit"
				className="w-full"
				disabled={isSaving}
			>
				{isSaving ? "Saving..." : "Save Measurements"}
			</Button>
		</DataEntryForm>
	);
}
