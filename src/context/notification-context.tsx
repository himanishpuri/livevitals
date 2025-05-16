"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import useSocket from "@/hooks/useSocket";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

type NotificationType =
	| "message"
	| "session_scheduled"
	| "session_reminder"
	| "instructor_online";

interface Notification {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	timestamp: number;
	read: boolean;
	data?: Record<string, any>;
}

interface NotificationContextType {
	notifications: Notification[];
	unreadCount: number;
	markAsRead: (id: string) => void;
	markAllAsRead: () => void;
	clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
	undefined,
);

export function useNotifications() {
	const context = useContext(NotificationContext);
	if (context === undefined) {
		throw new Error(
			"useNotifications must be used within a NotificationProvider",
		);
	}
	return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const { socket } = useSocket();
	const { user } = useAuth();

	const unreadCount = notifications.filter((n) => !n.read).length;

	// Handle new notifications
	useEffect(() => {
		if (!socket || !user) return;

		// Listen for new chat messages
		socket.on("new_notification", (notification: Notification) => {
			setNotifications((prev) => [notification, ...prev]);

			// Show toast for important notifications
			if (
				notification.type === "session_reminder" ||
				notification.type === "instructor_online"
			) {
				toast(notification.title, {
					description: notification.message,
				});
			}
		});

		// Listen for chat messages directed to the user
		socket.on("chat_message", (message: any) => {
			// Only create notifications for messages from others, not our own
			if (message.sender !== user.id) {
				const notification: Notification = {
					id: `msg-${message.id}`,
					type: "message",
					title: `New message from ${message.senderName}`,
					message:
						message.text.substring(0, 50) +
						(message.text.length > 50 ? "..." : ""),
					timestamp: Date.now(),
					read: false,
					data: { senderId: message.sender, roomId: message.roomId },
				};

				setNotifications((prev) => [notification, ...prev]);
			}
		});

		return () => {
			socket.off("new_notification");
			socket.off("chat_message");
		};
	}, [socket, user]);

	const markAsRead = (id: string) => {
		setNotifications((prev) =>
			prev.map((notification) =>
				notification.id === id
					? { ...notification, read: true }
					: notification,
			),
		);
	};

	const markAllAsRead = () => {
		setNotifications((prev) =>
			prev.map((notification) => ({ ...notification, read: true })),
		);
	};

	const clearNotifications = () => {
		setNotifications([]);
	};

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				unreadCount,
				markAsRead,
				markAllAsRead,
				clearNotifications,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
}
