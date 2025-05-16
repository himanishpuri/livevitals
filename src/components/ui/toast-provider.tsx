"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
	return (
		<Toaster
			position="top-right"
			toastOptions={{
				style: {
					background: "white",
					color: "#09090b",
					border: "1px solid #e2e8f0",
				},
				duration: 5000,
			}}
		/>
	);
}
