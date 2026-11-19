import { Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Footer() {
	return (
		<footer className="w-full border-t bg-background py-6">
			<div className="container flex flex-col mx-auto items-center justify-center gap-4 px-4 md:px-6">
				<div className="flex items-center gap-2">
					<Activity className="h-5 w-5 text-primary" />
					<span className="text-lg font-semibold">LiveVitals</span>
				</div>
				<div className="flex items-center gap-2">
					<Button asChild variant="link" size="sm">
						<Link href="/privacy">Privacy</Link>
					</Button>
					<Button asChild variant="link" size="sm">
						<Link href="/terms">Terms</Link>
					</Button>
				</div>
				<p className="text-center text-sm text-muted-foreground">
					&copy; {new Date().getFullYear()} LiveVitals. All rights
					reserved.
				</p>
			</div>
		</footer>
	);
}
