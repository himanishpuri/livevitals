import { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";

interface SocketServer extends HTTPServer {
	io?: SocketIOServer;
}

interface SocketWithIO extends NetSocket {
	server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
	socket: SocketWithIO;
}

// In-memory store for instructor status
const instructorStatus = new Map<string, boolean>();

// Initialize with some instructors
const initializeInstructorStatus = () => {
	if (instructorStatus.size === 0) {
		// Set random statuses for demo purposes
		instructorStatus.set("john-smith", Math.random() > 0.5);
		instructorStatus.set("sarah-johnson", Math.random() > 0.5);
		instructorStatus.set("michael-roberts", Math.random() > 0.5);
		instructorStatus.set("lisa-chen", Math.random() > 0.5);
		instructorStatus.set("david-patel", Math.random() > 0.5);
	}
};

const handler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
	if (res.socket.server.io) {
		console.log("Socket is already running");
		res.end();
		return;
	}

	console.log("Setting up socket");
	const io = new SocketIOServer(res.socket.server, {
		path: "/api/socketio",
		addTrailingSlash: false,
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
		},
	});

	res.socket.server.io = io;

	// Initialize instructor statuses
	initializeInstructorStatus();

	io.on("connection", (socket) => {
		console.log(`Client connected: ${socket.id}`);

		// When a client requests instructor status
		socket.on("get_instructor_status", () => {
			instructorStatus.forEach((available, id) => {
				socket.emit("instructor_status", { id, available });
			});
		});

		// When an instructor signs in
		socket.on("instructor_signin", (instructorId) => {
			instructorStatus.set(instructorId, true);
			io.emit("instructor_status", { id: instructorId, available: true });
			console.log(`Instructor ${instructorId} signed in`);
		});

		// When an instructor signs out
		socket.on("instructor_signout", (instructorId) => {
			instructorStatus.set(instructorId, false);
			io.emit("instructor_status", { id: instructorId, available: false });
			console.log(`Instructor ${instructorId} signed out`);
		});

		// When a client initiates a video call
		socket.on("initiate_call", ({ from, to }) => {
			if (instructorStatus.get(to)) {
				// Forward the call request to the instructor
				socket.broadcast.emit("incoming_call", { from, to });
			} else {
				// Notify client that instructor is not available
				socket.emit("call_failed", { reason: "Instructor is offline" });
			}
		});

		socket.on("disconnect", () => {
			console.log(`Client disconnected: ${socket.id}`);
		});
	});

	// Periodically update instructor status for demo purposes
	setInterval(() => {
		const instructorIds = Array.from(instructorStatus.keys());
		const randomInstructor =
			instructorIds[Math.floor(Math.random() * instructorIds.length)];
		const currentStatus = instructorStatus.get(randomInstructor) || false;

		// Toggle status with 20% probability
		if (Math.random() < 0.2) {
			instructorStatus.set(randomInstructor, !currentStatus);
			io.emit("instructor_status", {
				id: randomInstructor,
				available: !currentStatus,
			});
			console.log(
				`Instructor ${randomInstructor} is now ${
					!currentStatus ? "online" : "offline"
				}`,
			);
		}
	}, 30000); // Every 30 seconds

	res.end();
};

export default handler;
