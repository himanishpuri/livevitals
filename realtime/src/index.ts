import { createRealtimeServer } from "./server.ts";

const PORT = Number(process.env.PORT ?? 9000);
const CORS_ORIGIN = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

const { httpServer, close } = createRealtimeServer({ corsOrigin: CORS_ORIGIN });

httpServer.listen(PORT, "0.0.0.0", () => {
	console.log(`Realtime service listening on :${PORT}`);
});

for (const signal of ["SIGTERM", "SIGINT"] as const) {
	process.once(signal, () => {
		void close().then(() => process.exit(0));
	});
}
