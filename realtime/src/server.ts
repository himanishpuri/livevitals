import http from "node:http";
import express from "express";
import { ExpressPeerServer } from "peer";
import { Server } from "socket.io";
import type { Socket } from "socket.io";
import { WebSocketServer } from "ws";
import { isRecord, nonEmptyString } from "./guards.ts";
import type { Message, Notification } from "./types.ts";

const HISTORY_LIMIT = 200;
const MAX_MESSAGE_LENGTH = 2000;

export interface RealtimeServer {
	httpServer: http.Server;
	io: Server;
	close(): Promise<void>;
}

export function createRealtimeServer({
	corsOrigin,
}: {
	corsOrigin: string[];
}): RealtimeServer {
	const app = express();
	const httpServer = http.createServer(app);

	app.get("/health", (_req, res) => {
		res.status(200).send("ok");
	});

	// PeerJS gets its own noServer ws server: the default one aborts upgrades on
	// every other path, which kills socket.io's websocket transport.
	let peerWss: WebSocketServer | undefined;
	app.use(
		"/peerjs",
		ExpressPeerServer(httpServer, {
			path: "/",
			createWebSocketServer: () => {
				peerWss = new WebSocketServer({ noServer: true });
				return peerWss;
			},
		}),
	);
	httpServer.on("upgrade", (req, socket, head) => {
		if (!peerWss || !req.url?.startsWith("/peerjs/")) return;
		peerWss.handleUpgrade(req, socket, head, (ws) => {
			peerWss?.emit("connection", ws, req);
		});
	});

	const io = new Server(httpServer, { cors: { origin: corsOrigin } });

	const instructorOnline = new Map<string, boolean>();
	const socketsByUser = new Map<string, Set<string>>();
	const history = new Map<string, Message[]>();

	const emitActiveUsers = () => {
		io.emit("active_users_count", socketsByUser.size);
	};

	// Drop a socket from its user room bookkeeping; last socket of an online
	// instructor marks them offline.
	const detach = (socket: Socket) => {
		const userId = socket.data.userId as string | undefined;
		if (!userId) return;
		const sockets = socketsByUser.get(userId);
		sockets?.delete(socket.id);
		if (sockets && sockets.size > 0) return;
		socketsByUser.delete(userId);
		if (instructorOnline.get(userId)) {
			instructorOnline.set(userId, false);
			io.emit("instructor_status", { id: userId, available: false });
		}
	};

	io.on("connection", (socket) => {
		socket.on("identify", (payload: unknown) => {
			if (payload === null || payload === undefined) {
				const previous = socket.data.userId as string | undefined;
				detach(socket);
				if (previous) socket.leave(`user:${previous}`);
				socket.data = {};
				emitActiveUsers();
				return;
			}
			if (!isRecord(payload)) return;
			const userId = nonEmptyString(payload.userId);
			const role = payload.role;
			if (!userId || (role !== "user" && role !== "instructor")) return;
			if (socket.data.userId !== userId) detach(socket);
			socket.data = { userId, role };
			socket.join(`user:${userId}`);
			let sockets = socketsByUser.get(userId);
			if (!sockets) {
				sockets = new Set();
				socketsByUser.set(userId, sockets);
			}
			sockets.add(socket.id);
			emitActiveUsers();
		});

		socket.on("get_instructor_status", () => {
			instructorOnline.forEach((available, id) => {
				socket.emit("instructor_status", { id, available });
			});
		});

		socket.on("instructor_signin", (id: unknown) => {
			const instructorId = nonEmptyString(id);
			if (!instructorId) return;
			instructorOnline.set(instructorId, true);
			io.emit("instructor_status", { id: instructorId, available: true });
			const notification: Notification = {
				id: `online-${instructorId}-${Date.now()}`,
				type: "instructor_online",
				title: "Instructor online",
				message: `${instructorId} is now available`,
				timestamp: Date.now(),
				read: false,
				data: { instructorId },
			};
			socket.broadcast.emit("new_notification", notification);
		});

		socket.on("instructor_signout", (id: unknown) => {
			const instructorId = nonEmptyString(id);
			if (!instructorId) return;
			instructorOnline.set(instructorId, false);
			io.emit("instructor_status", { id: instructorId, available: false });
		});

		socket.on("initiate_call", (payload: unknown) => {
			if (!isRecord(payload)) return;
			const from = nonEmptyString(payload.from);
			const to = nonEmptyString(payload.to);
			if (!from || !to) return;
			if (instructorOnline.get(to)) {
				io.to(`user:${to}`).emit("incoming_call", { from, to });
			} else {
				socket.emit("call_failed", { reason: "Instructor is offline" });
			}
		});

		socket.on("join_chat", (roomId: unknown) => {
			const room = nonEmptyString(roomId);
			if (room?.startsWith("chat_")) socket.join(room);
		});

		socket.on("leave_chat", (roomId: unknown) => {
			const room = nonEmptyString(roomId);
			if (room?.startsWith("chat_")) socket.leave(room);
		});

		socket.on("send_chat_message", (payload: unknown, ack: unknown) => {
			const reply =
				typeof ack === "function" ? (ack as (ok: boolean) => void) : undefined;
			if (!isRecord(payload)) return reply?.(false);
			const roomId = nonEmptyString(payload.roomId);
			const message = payload.message;
			if (!roomId?.startsWith("chat_") || !isRecord(message)) {
				return reply?.(false);
			}
			const text = message.text;
			const sender = nonEmptyString(message.sender);
			if (
				typeof text !== "string" ||
				text.trim().length === 0 ||
				text.length > MAX_MESSAGE_LENGTH ||
				!sender
			) {
				return reply?.(false);
			}
			const stored = { ...message, roomId } as Message;
			const room = history.get(roomId) ?? [];
			room.push(stored);
			if (room.length > HISTORY_LIMIT) room.shift();
			history.set(roomId, room);

			// Room id is chat_<a>_<b> with sorted ids; ids never contain "_".
			const other = roomId
				.slice("chat_".length)
				.split("_")
				.find((participant) => participant !== sender);
			const target = other ? io.to(roomId).to(`user:${other}`) : io.to(roomId);
			target.emit("chat_message", stored);
			reply?.(true);
		});

		socket.on("get_chat_history", (roomId: unknown, ack: unknown) => {
			const room = nonEmptyString(roomId);
			if (!room || typeof ack !== "function") return;
			(ack as (messages: Message[]) => void)(history.get(room) ?? []);
		});

		socket.on("typing", (payload: unknown) => {
			if (!isRecord(payload)) return;
			const roomId = nonEmptyString(payload.roomId);
			const sender = nonEmptyString(payload.sender);
			if (!roomId || !sender) return;
			socket.to(roomId).emit("typing", { sender });
		});

		socket.on("disconnect", () => {
			detach(socket);
			emitActiveUsers();
		});
	});

	const close = async () => {
		const { promise, resolve } = Promise.withResolvers<void>();
		// Upgraded peer sockets would keep httpServer.close() waiting forever.
		for (const client of peerWss?.clients ?? []) client.terminate();
		peerWss?.close();
		io.close(() => {
			if (httpServer.listening) {
				httpServer.close(() => resolve());
			} else {
				resolve();
			}
		});
		await promise;
	};

	return { httpServer, io, close };
}
