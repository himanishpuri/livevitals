"use client";
import { Instructor } from "@/data/instructors";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
		<Link
			href={`/instructor-chat/${instructor.id}`}
			className={`block p-4 rounded-xl transition-all transform hover:scale-105 
        ${isAvailable ? "bg-white shadow-md" : "bg-gray-100"}`}
			onClick={handleClick}
		>
			<div className="flex flex-col items-center">
				<div className="relative mb-3">
					{/* Avatar with availability indicator */}
					<div className="w-24 h-24 rounded-full overflow-hidden relative border-2 border-white shadow-sm">
						<Image
							src={instructor.profileImage}
							alt={instructor.name}
							width={96}
							height={96}
							className="object-cover"
							onError={(e) => {
								// Fallback for image loading errors
								const target = e.target as HTMLImageElement;
								target.src =
									"https://via.placeholder.com/100?text=" +
									instructor.name.charAt(0);
							}}
						/>
					</div>

					{/* Status indicator */}
					<div
						className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white 
            ${isAvailable ? "bg-green-500" : "bg-gray-400"}`}
					/>
				</div>

				<h3 className="font-medium text-center">{instructor.name}</h3>
				<p className="text-sm text-gray-600 text-center">
					{instructor.specialty}
				</p>
				<span
					className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
						isAvailable
							? "bg-green-100 text-green-800"
							: "bg-gray-200 text-gray-600"
					}`}
				>
					{isAvailable ? "Available" : "Offline"}
				</span>
			</div>
		</Link>
	);
};

interface InstructorListProps {
	instructors: Instructor[];
}

export const InstructorList = ({ instructors }: InstructorListProps) => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
			{instructors.map((instructor) => (
				<InstructorCard
					key={instructor.id}
					instructor={instructor}
				/>
			))}
		</div>
	);
};
