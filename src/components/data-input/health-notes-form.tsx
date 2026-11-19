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
import { Textarea } from "@/components/ui/textarea";
import { DataEntryForm } from "@/components/data-input/data-entry-form";

const formSchema = z.object({
	notes: z.string().max(1000, "Notes must be less than 1000 characters"),
});

interface HealthNotesFormProps {
	initialNotes: string;
	onSave: (data: { notes: string }) => void;
	isSaving: boolean;
}

export function HealthNotesForm({
	initialNotes,
	onSave,
	isSaving,
}: HealthNotesFormProps) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			notes: initialNotes,
		},
	});

	return (
		<DataEntryForm
			form={form}
			onSubmit={onSave}
		>
			<FormField
				control={form.control}
				name="notes"
				render={({ field }) => (
					<FormItem>
						<div className="space-y-1">
							<FormLabel>Health Notes</FormLabel>
							<FormDescription>
								Record any health-related observations, symptoms, or notes
								for your records
							</FormDescription>
						</div>
						<div className="space-y-2 pt-2">
							<FormControl>
								<Textarea
									placeholder="Enter your health notes here..."
									className="min-h-[200px]"
									{...field}
								/>
							</FormControl>
							<div className="text-xs text-muted-foreground text-right">
								{field.value.length}/1000 characters
							</div>
						</div>
						<FormMessage />
					</FormItem>
				)}
			/>

			<Button
				type="submit"
				className="w-full"
				disabled={isSaving}
			>
				{isSaving ? "Saving..." : "Save Notes"}
			</Button>
		</DataEntryForm>
	);
}
