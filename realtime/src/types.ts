export type Role = "user" | "instructor";

export type NotificationType =
	"message" | "session_scheduled" | "session_reminder" | "instructor_online";

export interface Message {
	id: string;
	text: string;
	sender: string;
	senderName: string;
	senderRole: Role;
	timestamp: number;
	roomId?: string;
}

export interface Notification {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	timestamp: number;
	read: boolean;
	data?: { senderId?: string; instructorId?: string; roomId?: string };
}
