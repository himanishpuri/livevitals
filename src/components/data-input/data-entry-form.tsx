"use client";

import type { ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";

export function DataEntryForm<T extends FieldValues>({
	form,
	onSubmit,
	children,
}: {
	form: UseFormReturn<T>;
	onSubmit: (values: T) => void;
	children: ReactNode;
}) {
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-6"
			>
				{children}
			</form>
		</Form>
	);
}
