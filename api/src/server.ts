import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { env } from "./env.js";
import { authRoutes } from "./routes/auth.js";
import { geoRoutes } from "./routes/geo.js";
import { postRoutes } from "./routes/posts.js";
import { interestRoutes } from "./routes/interests.js";
import { reportRoutes } from "./routes/reports.js";
import { initChat } from "./realtime/chat.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: env.corsOrigin, credentials: true });
await app.register(jwt, { secret: env.jwtSecret, sign: { expiresIn: env.jwtExpiresIn } });

app.get("/health", async () => ({ ok: true, service: "brasa-api" }));

await app.register(authRoutes);
await app.register(geoRoutes);
await app.register(postRoutes);
await app.register(interestRoutes);
await app.register(reportRoutes);

try {
  await app.listen({ port: env.port, host: "0.0.0.0" });

  // Socket.io anexado ao mesmo servidor HTTP; reusa o verify do JWT do Fastify
  initChat(app.server, (token: string) => app.jwt.verify(token));
  app.log.info(`🔥 Brasa API + chat em http://localhost:${env.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
