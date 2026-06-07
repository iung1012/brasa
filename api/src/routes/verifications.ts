import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { authGuard, roleGuard } from "../auth.js";

export async function verificationRoutes(app: FastifyInstance) {

  // ── POST /verifications — usuário envia solicitação ────────────
  app.post("/verifications", { preHandler: authGuard }, async (req, reply) => {
    const schema = z.object({
      docFrontUrl: z.string().url(),
      docBackUrl:  z.string().url(),
      selfieUrl:   z.string().url(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    // impede envio duplicado enquanto pendente
    const existing = await prisma.verification.findFirst({
      where: { userId: req.user.sub, status: "PENDING" },
    });
    if (existing) return reply.code(409).send({ error: "Já existe uma solicitação pendente." });

    const verification = await prisma.verification.create({
      data: { userId: req.user.sub, ...parsed.data },
    });
    return reply.code(201).send(verification);
  });

  // ── GET /verifications/me — status do usuário atual ───────────
  app.get("/verifications/me", { preHandler: authGuard }, async (req) => {
    const v = await prisma.verification.findFirst({
      where: { userId: req.user.sub },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true, rejectedReason: true, createdAt: true },
    });
    return v ?? { status: "NONE" };
  });

  // ── Admin: listar pendentes ────────────────────────────────────
  app.get("/admin/verifications", { preHandler: roleGuard(["ADMIN", "MODERATOR"]) }, async (req) => {
    const { status = "PENDING", cursor, take = "20" } = req.query as Record<string, string>;
    const items = await prisma.verification.findMany({
      where: { status: status as "PENDING" | "APPROVED" | "REJECTED" },
      include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
      take: Number(take),
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    return items;
  });

  // ── Admin: aprovar ─────────────────────────────────────────────
  app.post("/admin/verifications/:id/approve", { preHandler: roleGuard(["ADMIN", "MODERATOR"]) }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const v = await prisma.verification.update({
      where: { id },
      data: { status: "APPROVED", reviewedBy: req.user.sub, reviewedAt: new Date() },
    });
    // atualiza o campo verification no user
    await prisma.user.update({ where: { id: v.userId }, data: { verification: "APPROVED" } });
    return { ok: true };
  });

  // ── Admin: rejeitar ────────────────────────────────────────────
  app.post("/admin/verifications/:id/reject", { preHandler: roleGuard(["ADMIN", "MODERATOR"]) }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = z.object({ reason: z.string().min(5) }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: "Motivo obrigatório" });

    const v = await prisma.verification.update({
      where: { id },
      data: { status: "REJECTED", rejectedReason: body.data.reason, reviewedBy: req.user.sub, reviewedAt: new Date() },
    });
    await prisma.user.update({ where: { id: v.userId }, data: { verification: "NONE" } });
    return { ok: true };
  });
}
