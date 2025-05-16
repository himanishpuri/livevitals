"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import useSocket from "@/hooks/useSocket";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";

interface Message {
	id: string;
	text: string;
	sender: string;
	senderName: string;
	senderRole: "user" | "instructor";
	timestamp: number;
}

interface ChatComponentProps {
	instructorId: string;
	instructorName: string;
	instructorImage: string;
}

export function ChatComponent({
	instructorId,
	instructorName,
	instructorImage,
}: ChatComponentProps) {
	const { socket } = useSocket();
	const { user } = useAuth();
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [isSending, setIsSending] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [chatRoomId, setChatRoomId] = useState<string>("");

	// Generate a deterministic chat room ID from user and instructor IDs
	useEffect(() => {
		if (user?.id && instructorId) {
			// Sort the IDs to ensure the same room ID regardless of who initiates
			const sortedIds = [user.id, instructorId].sort();
			setChatRoomId(`chat_${sortedIds[0]}_${sortedIds[1]}`);
		}
	}, [user?.id, instructorId]);

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Initialize socket events
	useEffect(() => {
		if (!socket || !chatRoomId) return;

		// Join the chat room
		socket.emit("join_chat", chatRoomId);

		// Listen for incoming messages
		socket.on("chat_message", (message: Message) => {
			setMessages((prev) => [...prev, message]);
		});

		// Fetch message history
		socket.emit("get_chat_history", chatRoomId, (history: Message[]) => {
			if (Array.isArray(history)) {
				setMessages(history);
			}
		});

		return () => {
			socket.off("chat_message");
			socket.emit("leave_chat", chatRoomId);
		};
	}, [socket, chatRoomId]);

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();

		if (!newMessage.trim() || !socket || !user) return;

		setIsSending(true);

		const message: Message = {
			id: crypto.randomUUID(),
			text: newMessage,
			sender: user.id,
			senderName: user.name,
			senderRole: user.role as "user" | "instructor",
			timestamp: Date.now(),
		};

		socket.emit(
			"send_chat_message",
			{ roomId: chatRoomId, message },
			(success: boolean) => {
				if (success) {
					setNewMessage("");
				}
				setIsSending(false);
			},
		);
	};

	return (
		<div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background">
			{/* Chat header */}
			<div className="px-4 py-3 border-b bg-muted/30 flex items-center">
				<div className="flex items-center">
					<div className="w-8 h-8 rounded-full overflow-hidden mr-2">
						<Image
							src={instructorImage}
							alt={instructorName}
							width={32}
							height={32}
							className="object-cover"
						/>
					</div>
					<div>
						<h3 className="text-sm font-medium">{instructorName}</h3>
						<p className="text-xs text-muted-foreground">Chat</p>
					</div>
				</div>
			</div>

			{/* Messages area */}
			<ScrollArea className="flex-1 p-4">
				<div className="space-y-4">
					{messages.length === 0 ? (
						<div className="text-center text-muted-foreground py-8">
							<p>No messages yet</p>
							<p className="text-xs">
								Start the conversation by sending a message
							</p>
						</div>
					) : (
						messages.map((message) => {
							const isOwnMessage = message.sender === user?.id;
							return (
								<div
									key={message.id}
									className={`flex ${
										isOwnMessage ? "justify-end" : "justify-start"
									}`}
								>
									<div
										className={`max-w-[80%] rounded-lg px-4 py-2 ${
											isOwnMessage
												? "bg-primary text-primary-foreground"
												: "bg-muted"
										}`}
									>
										<p className="text-sm">{message.text}</p>
										<p className="text-xs opacity-70 mt-1">
											{new Date(
												message.timestamp,
											).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>
								</div>
							);
						})
					)}
					<div ref={messagesEndRef} />
				</div>
			</ScrollArea>

			{/* Message input */}
			<div className="p-3 border-t">
				<form
					onSubmit={handleSendMessage}
					className="flex gap-2"
				>
					<Input
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						placeholder="Type a message..."
						className="flex-1"
						disabled={isSending}
					/>
					<Button
						type="submit"
						size="icon"
						disabled={isSending || !newMessage.trim()}
					>
						<Send className="h-4 w-4" />
					</Button>
				</form>
			</div>
		</div>
	);
}
