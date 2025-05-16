export interface Instructor {
	id: string;
	name: string;
	profileImage: string;
	specialty: string;
	biography: string;
	availability?: boolean; // Will be updated via WebSocket
}

export const instructors: Instructor[] = [
	{
		id: "john-smith",
		name: "John Smith",
		profileImage: "/instructors/male.jpg",
		specialty: "Nutrition & Weight Management",
		biography:
			"John is a certified nutrition coach with 10+ years of experience helping clients achieve their health goals through balanced diet and lifestyle changes.",
	},
	{
		id: "sarah-johnson",
		name: "Sarah Johnson",
		profileImage: "/instructors/female.webp",
		specialty: "Strength Training",
		biography:
			"Sarah specializes in strength training and functional fitness, helping clients build muscle and improve overall body composition.",
	},
];
