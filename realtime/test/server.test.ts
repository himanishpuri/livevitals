import type { AddressInfo } from "node:net";
import { io, type Socket } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRealtimeServer, type RealtimeServer } from "../src/server.ts";
import type { Message, Notification, Role } from "../src/types.ts";

let server: RealtimeServer;
let url: string;
const clients: Socket[] = [];

beforeEach(async () => {
	server = createRealtimeServer({ corsOrigin: ["http://localhost:3000"] });
	const { promise, resolve } = Promise.withResolvers<void>();
	server.httpServer.listen(0, "127.0.0.1", resolve);
	await promise;
	const { port } = server.httpServer.address() as AddressInfo;
	url = `http://127.0.0.1:${port}`;
});

afterEach(async () => {
	for (const client of clients.splice(0)) client.disconnect();
	await server.close();
});

async function connectClient(): Promise<Socket> {
	const socket = io(url, { transports: ["websocket"], forceNew: true });
	clients.push(socket);
	const { promise, resolve, reject } = Promise.withResolvers<void>();
	socket.once("connect", resolve);
	socket.once("connect_error", reject);
	await promise;
	return socket;
}

function once<T>(socket: Socket, event: string): Promise<T> {
	const { promise, resolve } = Promise.withResolvers<T>();
	socket.once(event, (value: T) => resolve(value));
	return promise;
}

// Waits until the server has handled everything this socket sent before the
// barrier: packets on one connection are ordered both ways.
async function barrier(socket: Socket): Promise<void> {
	const { promise, resolve } = Promise.withResolvers<void>();
	socket.emit("get_chat_history", "chat_barrier", () => resolve());
	await promise;
}

async function identify(
	socket: Socket,
	userId: string,
	role: Role = "user",
): Promise<void> {
	socket.emit("identify", { userId, role });
	await barrier(socket);
}

function collect<T>(socket: Socket, event: string): T[] {
	const received: T[] = [];
	socket.on(event, (value: T) => received.push(value));
	return received;
}

const chatRoom = "chat_alice_bob";
const message: Message = {
	id: "m1",
	text: "hello",
	sender: "alice",
	senderName: "Alice",
	senderRole: "user",
	timestamp: 1_700_000_000_000,
};

describe("realtime server", () => {
	it("serves a health check", async () => {
		const response = await fetch(`${url}/health`);
		expect(response.status).toBe(200);
		expect(await response.text()).toBe("ok");
	});

	it("counts identified users", async () => {
		const alice = await connectClient();
		const bob = await connectClient();
		const counts = collect<number>(bob, "active_users_count");
		await identify(alice, "alice");
		await identify(bob, "bob");
		expect(counts.at(-1)).toBe(2);
	});

	it("announces a signed-in instructor", async () => {
		const instructor = await connectClient();
		const user = await connectClient();
		const status = once<{ id: string; available: boolean }>(
			user,
			"instructor_status",
		);
		const notification = once<Notification>(user, "new_notification");
		instructor.emit("instructor_signin", "john-smith");
		expect(await status).toEqual({ id: "john-smith", available: true });
		const note = await notification;
		expect(note.type).toBe("instructor_online");
		expect(note.data?.instructorId).toBe("john-smith");
	});

	it("rejects calls to an offline instructor", async () => {
		const caller = await connectClient();
		const failed = once<{ reason: string }>(caller, "call_failed");
		caller.emit("initiate_call", { from: "peer-1", to: "john-smith" });
		expect((await failed).reason).toBe("Instructor is offline");
	});

	it("rings only the online instructor", async () => {
		const instructor = await connectClient();
		const caller = await connectClient();
		const stranger = await connectClient();
		await identify(instructor, "john-smith", "instructor");
		instructor.emit("instructor_signin", "john-smith");
		await barrier(instructor);

		const strangerCalls = collect<unknown>(stranger, "incoming_call");
		const callerFailures = collect<unknown>(caller, "call_failed");
		const incoming = once<{ from: string; to: string }>(
			instructor,
			"incoming_call",
		);
		caller.emit("initiate_call", { from: "caller-peer", to: "john-smith" });
		expect(await incoming).toEqual({ from: "caller-peer", to: "john-smith" });
		await barrier(stranger);
		await barrier(caller);
		expect(strangerCalls).toHaveLength(0);
		expect(callerFailures).toHaveLength(0);
	});

	it("delivers a chat message once to the room and the other participant", async () => {
		const alice = await connectClient();
		const bob = await connectClient();
		await identify(alice, "alice");
		await identify(bob, "bob");
		const aliceMessages = collect<Message>(alice, "chat_message");
		const bobMessages = collect<Message>(bob, "chat_message");
		alice.emit("join_chat", chatRoom);

		const aliceGot = once<Message>(alice, "chat_message");
		const bobGot = once<Message>(bob, "chat_message");
		const ack = Promise.withResolvers<boolean>();
		alice.emit("send_chat_message", { roomId: chatRoom, message }, ack.resolve);
		expect(await ack.promise).toBe(true);
		await aliceGot;
		await bobGot;
		await barrier(alice);
		await barrier(bob);
		expect(aliceMessages).toHaveLength(1);
		expect(bobMessages).toHaveLength(1);
		expect(bobMessages[0].roomId).toBe(chatRoom);
	});

	it("rejects an empty chat message", async () => {
		const alice = await connectClient();
		const ack = Promise.withResolvers<boolean>();
		alice.emit(
			"send_chat_message",
			{ roomId: chatRoom, message: { ...message, text: "   " } },
			ack.resolve,
		);
		expect(await ack.promise).toBe(false);
	});

	it("returns the chat history of a room", async () => {
		const alice = await connectClient();
		const sent = Promise.withResolvers<boolean>();
		alice.emit(
			"send_chat_message",
			{ roomId: chatRoom, message },
			sent.resolve,
		);
		expect(await sent.promise).toBe(true);

		const history = Promise.withResolvers<Message[]>();
		alice.emit("get_chat_history", chatRoom, history.resolve);
		const messages = await history.promise;
		expect(messages).toHaveLength(1);
		expect(messages[0].text).toBe("hello");
	});

	it("marks an instructor offline when their last socket leaves", async () => {
		const instructor = await connectClient();
		const user = await connectClient();
		await identify(instructor, "john-smith", "instructor");
		const online = once<{ id: string; available: boolean }>(
			user,
			"instructor_status",
		);
		instructor.emit("instructor_signin", "john-smith");
		expect((await online).available).toBe(true);

		const offline = once<{ id: string; available: boolean }>(
			user,
			"instructor_status",
		);
		instructor.disconnect();
		expect(await offline).toEqual({ id: "john-smith", available: false });
	});

	it("hands out a peer id", async () => {
		const response = await fetch(`${url}/peerjs/peerjs/id`);
		expect(response.status).toBe(200);
		expect((await response.text()).length).toBeGreaterThan(0);
	});
});
