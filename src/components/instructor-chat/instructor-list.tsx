"use client";
import type { Instructor } from "@/data/instructors";
import type React from "react";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Video, Star, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InstructorCardProps {
	instructor: Instructor;
}

const InstructorCard = ({ instructor }: InstructorCardProps) => {
	const { isAuthenticated } = useAuth();
	const router = useRouter();
	const isAvailable = instructor.availability === true;

	const handleClick = (e: React.MouseEvent) => {
		if (!isAuthenticated) {
			e.preventDefault();
			toast.error("Please sign in to start a consultation");
			router.push("/login");
			return;
		}

		if (!isAvailable) {
			e.preventDefault();
			toast.warning(`${instructor.name} is currently offline`);
			return;
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			whileHover={{ y: -5 }}
			className={`rounded-xl overflow-hidden transition-all ${
				isAvailable
					? "bg-white dark:bg-card shadow-lg"
					: "bg-muted/50 dark:bg-muted/20"
			}`}
		>
			<div className="p-6">
				<div className="flex flex-col items-center text-center">
					{/* Avatar with availability indicator */}
					<div className="relative mb-4">
						<div className="w-28 h-28 rounded-full overflow-hidden relative border-4 border-background shadow-sm">
							<Image
								src={instructor.profileImage || "/placeholder.svg"}
								alt={instructor.name}
								width={112}
								height={112}
								className="object-cover"
								onError={(e) => {
									// Fallback for image loading errors
									const target = e.target as HTMLImageElement;
									target.src =
										"https://via.placeholder.com/112?text=" +
										instructor.name.charAt(0);
								}}
							/>
						</div>

						{/* Status indicator */}
						<div
							className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-background 
								${isAvailable ? "bg-green-500" : "bg-gray-400"}`}
						/>
					</div>

					<h3 className="text-xl font-semibold">{instructor.name}</h3>
					<p className="text-primary font-medium text-sm mb-3">
						{instructor.specialty}
					</p>

					<div className="flex items-center gap-1 mb-4">
						{[1, 2, 3, 4, 5].map((star) => (
							<Star
								key={star}
								className="h-4 w-4 fill-yellow-400 text-yellow-400"
							/>
						))}
					</div>

					<p className="text-muted-foreground text-sm mb-5 line-clamp-2">
						{instructor.biography}
					</p>

					<div className="flex items-center gap-2 mb-5">
						<span
							className={`px-3 py-1 rounded-full text-xs font-medium ${
								isAvailable
									? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
									: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
							}`}
						>
							{isAvailable ? "Available Now" : "Offline"}
						</span>

						<span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
							<Clock className="inline-block h-3 w-3 mr-1" />
							30 min
						</span>
					</div>

					<Button
						asChild
						variant={isAvailable ? "default" : "outline"}
						className="w-full"
						disabled={!isAvailable}
					>
						<Link
							href={`/instructor-chat/${instructor.id}`}
							onClick={handleClick}
						>
							{isAvailable ? (
								<>
									<Video className="h-4 w-4 mr-2" /> Start Consultation
								</>
							) : (
								<>
									<Calendar className="h-4 w-4 mr-2" /> Schedule
									Session
								</>
							)}
						</Link>
					</Button>
				</div>
			</div>
		</motion.div>
	);
};

interface InstructorListProps {
	instructors: Instructor[];
}

export const InstructorList = ({ instructors }: InstructorListProps) => {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{instructors.map((instructor) => (
				<InstructorCard
					key={instructor.id}
					instructor={instructor}
				/>
			))}
		</div>
	);
};
