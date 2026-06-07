import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import staticFiles from "@fastify/static";
import { join } from "node:path";
import { env } from "./env.js";
import { authRoutes } from "./routes/auth.js";
import { geoRoutes } from "./routes/geo.js";
import { postRoutes } from "./routes/posts.js";
import { interestRoutes } from "./routes/interests.js";
import { reportRoutes } from "./routes/reports.js";
import { uploadRoutes } from "./routes/upload.js";
import { userRoutes }          from "./routes/users.js";
import { verificationRoutes } from "./routes/verifications.js";
import { adminRoutes }        from "./routes/admin.js";
import { initChat } from "./realtime/chat.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: env.corsOrigin, credentials: true });
await app.register(jwt, { secret: env.jwtSecret, sign: { expiresIn: env.jwtExpiresIn } });
await app.register(multipart);
await app.register(staticFiles, {
  root: join(process.cwd(), "uploads"),
  prefix: "/uploads/",
});

app.get("/health", async () => ({ ok: true, service: "brasa-api" }));

await app.register(authRoutes);
await app.register(geoRoutes);
await app.register(postRoutes);
await app.register(interestRoutes);
await app.register(reportRoutes);
await app.register(uploadRoutes);
await app.register(userRoutes);
await app.register(verificationRoutes);
await app.register(adminRoutes);

try {
  await app.listen({ port: env.port, host: "0.0.0.0" });
  initChat(app.server, (token: string) => app.jwt.verify(token));
  app.log.info(`Brasa API rodando em http://localhost:${env.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
