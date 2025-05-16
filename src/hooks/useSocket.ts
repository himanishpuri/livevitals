import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Instructor, instructors } from "@/data/instructors";

interface UseSocketReturn {
	instructors: Instructor[];
	isConnected: boolean;
	socket: Socket | null;
}

const useSocket = (): UseSocketReturn => {
	const [isConnected, setIsConnected] = useState(false);
	const [instructorsList, setInstructorsList] =
		useState<Instructor[]>(instructors);
	const socket = useRef<Socket | null>(null);

	const socketInitializer = async () => {
		if (!socket.current) {
			// Connect to WebSocket server
			socket.current = io("http://localhost:9000");

			// Handle connection events
			socket.current.on("connect", () => {
				console.log("Socket connected");
				setIsConnected(true);
			});

			socket.current.on("disconnect", () => {
				console.log("Socket disconnected");
				setIsConnected(false);
			});

			// Update instructor availability when received from server
			socket.current.on(
				"instructor_status",
				(data: { id: string; available: boolean }) => {
					setInstructorsList((prev) =>
						prev.map((instructor) =>
							instructor.id === data.id
								? { ...instructor, availability: data.available }
								: instructor,
						),
					);
				},
			);

			// Get initial instructor statuses
			socket.current.emit("get_instructor_status");
		}
	};

	useEffect(() => {
		socketInitializer();

		return () => {
			if (socket.current) {
				socket.current.disconnect();
			}
		};
	}, []);

	return {
		instructors: instructorsList,
		isConnected,
		socket: socket.current,
	};
};

export default useSocket;
