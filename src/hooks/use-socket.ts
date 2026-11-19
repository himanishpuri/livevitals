import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { Instructor, instructors } from "@/data/instructors";
import { getSocket } from "@/lib/realtime";

interface UseSocketReturn {
	instructors: Instructor[];
	isConnected: boolean;
	socket: Socket;
}

const useSocket = (): UseSocketReturn => {
	const socket = getSocket();
	const [isConnected, setIsConnected] = useState(socket.connected);
	const [instructorsList, setInstructorsList] =
		useState<Instructor[]>(instructors);

	useEffect(() => {
		const onConnect = () => setIsConnected(true);
		const onDisconnect = () => setIsConnected(false);

		// Update instructor availability when received from server
		const onInstructorStatus = (data: { id: string; available: boolean }) => {
			setInstructorsList((prev) =>
				prev.map((instructor) =>
					instructor.id === data.id
						? { ...instructor, availability: data.available }
						: instructor,
				),
			);
		};

		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);
		socket.on("instructor_status", onInstructorStatus);
		socket.emit("get_instructor_status");

		return () => {
			// Only drop this hook's listeners: the socket is a shared singleton.
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			socket.off("instructor_status", onInstructorStatus);
		};
	}, [socket]);

	return { instructors: instructorsList, isConnected, socket };
};

export default useSocket;
