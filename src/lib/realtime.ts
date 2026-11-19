import { io, type Socket } from "socket.io-client";
import type { PeerOptions } from "peerjs";

const REALTIME_URL =
	process.env.NEXT_PUBLIC_REALTIME_URL ?? "http://localhost:9000";

let socket: Socket | null = null;

export function getSocket(): Socket {
	socket ??= io(REALTIME_URL);
	return socket;
}

export function peerOptions(): PeerOptions {
	const url = new URL(REALTIME_URL);
	const secure = url.protocol === "https:";
	return {
		host: url.hostname,
		port: Number(url.port || (secure ? 443 : 80)),
		path: "/peerjs",
		secure,
	};
}
