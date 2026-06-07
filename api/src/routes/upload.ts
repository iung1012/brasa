import type { FastifyInstance } from "fastify";
import { pipeline } from "node:stream/promises";
import { createWriteStream, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { extname, join } from "node:path";
import { authGuard } from "../auth.js";

const UPLOAD_DIR = join(process.cwd(), "uploads");
mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4"]);
const MAX_BYTES = 30 * 1024 * 1024; // 30MB

export async function uploadRoutes(app: FastifyInstance) {
  app.post("/upload", { preHandler: authGuard }, async (req, reply) => {
    const data = await req.file({ limits: { fileSize: MAX_BYTES } });
    if (!data) return reply.code(400).send({ error: "Nenhum arquivo recebido" });
    if (!ALLOWED_MIME.has(data.mimetype))
      return reply.code(400).send({ error: "Tipo de arquivo não permitido" });

    const ext  = extname(data.filename) || ".jpg";
    const name = `${randomUUID()}${ext}`;
    const dest = join(UPLOAD_DIR, name);

    await pipeline(data.file, createWriteStream(dest));

    // Em produção: substituir pelo upload para S3/R2 e retornar a URL pública do CDN
    const url = `/uploads/${name}`;
    return { url };
  });
}
