"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/context/notification-context";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, formatDistanceToNow } from "date-fns";

export function NotificationDropdown() {
	const router = useRouter();
	const { notifications, unreadCount, markAsRead, markAllAsRead } =
		useNotifications();
	const [open, setOpen] = useState(false);

	const handleNotificationClick = (notification: any) => {
		markAsRead(notification.id);
		setOpen(false);

		// Route based on notification type
		if (notification.type === "message" && notification.data?.senderId) {
			router.push(`/instructor-chat/${notification.data.senderId}`);
		} else if (
			notification.type === "session_scheduled" ||
			notification.type === "session_reminder"
		) {
			router.push("/schedule");
		} else if (
			notification.type === "instructor_online" &&
			notification.data?.instructorId
		) {
			router.push(`/instructor-chat/${notification.data.instructorId}`);
		}
	};

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
		>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative"
				>
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
							{unreadCount > 9 ? "9+" : unreadCount}
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-80 p-0"
				align="end"
			>
				<div className="flex items-center justify-between p-4 border-b">
					<h4 className="font-medium text-sm">Notifications</h4>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={markAllAsRead}
							className="text-xs h-8"
						>
							Mark all as read
						</Button>
					)}
				</div>

				<ScrollArea className="h-80">
					{notifications.length > 0 ? (
						<div className="divide-y">
							{notifications.map((notification) => (
								<div
									key={notification.id}
									className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
										!notification.read
											? "bg-blue-50/50 dark:bg-blue-900/10"
											: ""
									}`}
									onClick={() => handleNotificationClick(notification)}
								>
									<div className="flex justify-between items-start">
										<h5
											className={`text-sm ${
												!notification.read ? "font-medium" : ""
											}`}
										>
											{notification.title}
										</h5>
										<span className="text-xs text-muted-foreground">
											{formatDistanceToNow(notification.timestamp, {
												addSuffix: true,
											})}
										</span>
									</div>
									<p className="text-xs text-muted-foreground mt-1">
										{notification.message}
									</p>
								</div>
							))}
						</div>
					) : (
						<div className="p-8 text-center">
							<p className="text-sm text-muted-foreground">
								No notifications
							</p>
						</div>
					)}
				</ScrollArea>

				{notifications.length > 0 && (
					<div className="p-2 border-t text-center">
						<Button
							variant="ghost"
							size="sm"
							className="text-xs w-full"
							onClick={() => setOpen(false)}
						>
							Close
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
