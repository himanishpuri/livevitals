"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import useSocket from "@/hooks/useSocket";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

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
	instructorName?: string;
	instructorImage?: string;
}

export function ChatComponent({
	instructorId,
	instructorName = "Instructor",
	instructorImage = "/instructors/male.jpg",
}: ChatComponentProps) {
	const { socket } = useSocket();
	const { user } = useAuth();
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [isSending, setIsSending] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [chatRoomId, setChatRoomId] = useState<string>("");
	const [isTyping, setIsTyping] = useState(false);
	const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
			setIsTyping(false);
		});

		// Listen for typing events
		socket.on("typing", ({ sender }) => {
			if (sender !== user?.id) {
				setIsTyping(true);

				// Clear previous timeout
				if (typingTimeoutRef.current) {
					clearTimeout(typingTimeoutRef.current);
				}

				// Set new timeout to clear typing indicator
				typingTimeoutRef.current = setTimeout(() => {
					setIsTyping(false);
				}, 3000);
			}
		});

		// Fetch message history
		socket.emit("get_chat_history", chatRoomId, (history: Message[]) => {
			if (Array.isArray(history)) {
				setMessages(history);
			}
		});

		return () => {
			socket.off("chat_message");
			socket.off("typing");
			socket.emit("leave_chat", chatRoomId);

			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
		};
	}, [socket, chatRoomId, user?.id]);

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

	const handleTyping = () => {
		if (socket && user) {
			socket.emit("typing", { roomId: chatRoomId, sender: user.id });
		}
	};

	// Group messages by date
	const groupedMessages: { [date: string]: Message[] } = {};
	messages.forEach((message) => {
		const date = format(new Date(message.timestamp), "MMMM d, yyyy");
		if (!groupedMessages[date]) {
			groupedMessages[date] = [];
		}
		groupedMessages[date].push(message);
	});

	return (
		<div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background shadow-sm">
			{/* Chat header */}
			<div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
				<div className="flex items-center">
					<div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-border">
						<Image
							src={instructorImage || "/placeholder.svg"}
							alt={instructorName}
							width={40}
							height={40}
							className="object-cover"
						/>
					</div>
					<div>
						<h3 className="font-medium">{instructorName}</h3>
						<p className="text-xs text-muted-foreground">
							{isTyping ? (
								<span className="text-primary">Typing...</span>
							) : (
								"Chat"
							)}
						</p>
					</div>
				</div>
				<div>
					<Button
						variant="ghost"
						size="icon"
					>
						<Smile className="h-5 w-5 text-muted-foreground" />
					</Button>
				</div>
			</div>

			{/* Messages area */}
			<ScrollArea className="flex-1 p-4">
				{Object.keys(groupedMessages).length === 0 ? (
					<div className="text-center text-muted-foreground py-12">
						<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
							<Send className="h-6 w-6 text-primary" />
						</div>
						<p className="font-medium">No messages yet</p>
						<p className="text-sm mt-1">
							Start the conversation by sending a message
						</p>
					</div>
				) : (
					<div className="space-y-6">
						{Object.entries(groupedMessages).map(
							([date, dateMessages]) => (
								<div
									key={date}
									className="space-y-4"
								>
									<div className="relative flex items-center justify-center">
										<div className="absolute inset-0 flex items-center">
											<div className="w-full border-t border-border"></div>
										</div>
										<div className="relative px-4 bg-background text-xs text-muted-foreground">
											{date}
										</div>
									</div>

									<div className="space-y-4">
										{dateMessages.map((message, index) => {
											const isOwnMessage =
												message.sender === user?.id;
											const showAvatar =
												index === 0 ||
												dateMessages[index - 1]?.sender !==
													message.sender;

											return (
												<div
													key={message.id}
													className={`flex ${
														isOwnMessage
															? "justify-end"
															: "justify-start"
													}`}
												>
													<div
														className={`flex ${
															isOwnMessage
																? "flex-row-reverse"
																: "flex-row"
														} max-w-[80%] items-end gap-2`}
													>
														{!isOwnMessage && showAvatar && (
															<div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
																<Image
																	src={
																		instructorImage ||
																		"/placeholder.svg"
																	}
																	alt={instructorName}
																	width={32}
																	height={32}
																	className="object-cover"
																/>
															</div>
														)}

														{!isOwnMessage && !showAvatar && (
															<div className="w-8 flex-shrink-0" />
														)}

														<motion.div
															initial={{ opacity: 0, y: 10 }}
															animate={{ opacity: 1, y: 0 }}
															className={`rounded-2xl px-4 py-2 ${
																isOwnMessage
																	? "bg-primary text-primary-foreground rounded-br-none"
																	: "bg-muted rounded-bl-none"
															}`}
														>
															<p className="text-sm whitespace-pre-wrap break-words">
																{message.text}
															</p>
															<p className="text-xs opacity-70 mt-1 text-right">
																{format(
																	new Date(message.timestamp),
																	"h:mm a",
																)}
															</p>
														</motion.div>

														{isOwnMessage && showAvatar && (
															<div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
																<span className="text-xs font-medium">
																	{user?.name
																		.charAt(0)
																		.toUpperCase()}
																</span>
															</div>
														)}

														{isOwnMessage && !showAvatar && (
															<div className="w-8 flex-shrink-0" />
														)}
													</div>
												</div>
											);
										})}
									</div>
								</div>
							),
						)}

						<AnimatePresence>
							{isTyping && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0 }}
									className="flex justify-start"
								>
									<div className="flex items-end gap-2">
										<div className="w-8 h-8 rounded-full overflow-hidden">
											<Image
												src={instructorImage || "/placeholder.svg"}
												alt={instructorName}
												width={32}
												height={32}
												className="object-cover"
											/>
										</div>
										<div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3">
											<div className="flex space-x-1">
												<div
													className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
													style={{ animationDelay: "0ms" }}
												></div>
												<div
													className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
													style={{ animationDelay: "150ms" }}
												></div>
												<div
													className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
													style={{ animationDelay: "300ms" }}
												></div>
											</div>
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						<div ref={messagesEndRef} />
					</div>
				)}
			</ScrollArea>

			{/* Message input */}
			<div className="p-3 border-t">
				<form
					onSubmit={handleSendMessage}
					className="flex gap-2"
				>
					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="flex-shrink-0"
					>
						<Paperclip className="h-5 w-5 text-muted-foreground" />
					</Button>

					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="flex-shrink-0"
					>
						<ImageIcon className="h-5 w-5 text-muted-foreground" />
					</Button>

					<Input
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						onKeyDown={() => handleTyping()}
						placeholder="Type a message..."
						className="flex-1"
						disabled={isSending}
					/>

					<Button
						type="submit"
						size="icon"
						disabled={isSending || !newMessage.trim()}
						className="flex-shrink-0"
					>
						<Send className="h-5 w-5" />
					</Button>
				</form>
			</div>
		</div>
	);
}
