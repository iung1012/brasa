import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { roleGuard } from "../auth.js";

const adminGuard = roleGuard(["ADMIN", "MODERATOR"]);

export async function adminRoutes(app: FastifyInstance) {

  // ── Dashboard stats ────────────────────────────────────────────
  app.get("/admin/stats", { preHandler: adminGuard }, async () => {
    const [users, posts, pendingVerifs, pendingReports, newUsersToday] = await Promise.all([
      prisma.user.count({ where: { bannedAt: null } }),
      prisma.post.count(),
      prisma.verification.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "OPEN" } }),
      prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 86_400_000) } } }),
    ]);
    return { users, posts, pendingVerifs, pendingReports, newUsersToday };
  });

  // ── Usuários ───────────────────────────────────────────────────
  app.get("/admin/users", { preHandler: adminGuard }, async (req) => {
    const { q = "", cursor, take = "30", banned = "false" } = req.query as Record<string, string>;
    const where: Record<string, unknown> = banned === "true" ? { bannedAt: { not: null } } : {};
    if (q) {
      where.OR = [
        { username: { contains: q, mode: "insensitive" } },
        { displayName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }
    return prisma.user.findMany({
      where,
      select: {
        id: true, username: true, displayName: true, email: true,
        avatarUrl: true, role: true, verification: true, profileType: true,
        bannedAt: true, createdAt: true,
        _count: { select: { posts: true, reports: true } },
      },
      orderBy: { createdAt: "desc" },
      take: Number(take),
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  });

  app.post("/admin/users/:id/ban", { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = z.object({ reason: z.string().min(3) }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: "Motivo obrigatório" });
    await prisma.user.update({ where: { id }, data: { bannedAt: new Date() } });
    return { ok: true };
  });

  app.post("/admin/users/:id/unban", { preHandler: adminGuard }, async (req) => {
    const { id } = req.params as { id: string };
    await prisma.user.update({ where: { id }, data: { bannedAt: null } });
    return { ok: true };
  });

  app.patch("/admin/users/:id/role", { preHandler: roleGuard(["ADMIN"]) }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = z.object({ role: z.enum(["USER", "MODERATOR", "ADMIN"]) }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: "Role inválido" });
    await prisma.user.update({ where: { id }, data: { role: body.data.role } });
    return { ok: true };
  });

  // ── Denúncias ──────────────────────────────────────────────────
  app.get("/admin/reports", { preHandler: adminGuard }, async (req) => {
    const { status = "OPEN", cursor, take = "20" } = req.query as Record<string, string>;
    return prisma.report.findMany({
      where: { status: status as "OPEN" | "RESOLVED" | "DISMISSED" },
      include: {
        reporter: { select: { username: true, displayName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "asc" },
      take: Number(take),
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  });

  app.post("/admin/reports/:id/resolve", { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = z.object({
      action: z.enum(["IGNORE", "WARN", "REMOVE_CONTENT", "BAN_USER"]),
    }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: "Ação inválida" });

    await prisma.report.update({
      where: { id },
      data: { status: "RESOLVED", resolvedBy: req.user.sub, resolvedAt: new Date() },
    });
    return { ok: true };
  });

  // ── Banners ────────────────────────────────────────────────────
  app.get("/admin/banners", { preHandler: adminGuard }, async () => {
    return prisma.banner.findMany({ orderBy: { createdAt: "desc" } });
  });

  app.post("/admin/banners", { preHandler: adminGuard }, async (req, reply) => {
    const schema = z.object({
      imageUrl:       z.string().url(),
      link:           z.string().optional(),
      position:       z.string(),
      audienceFilter: z.string().optional(),
      startsAt:       z.coerce.date().optional(),
      endsAt:         z.coerce.date().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const banner = await prisma.banner.create({ data: { ...parsed.data, active: true } });
    return reply.code(201).send(banner);
  });

  app.patch("/admin/banners/:id", { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = z.object({ active: z.boolean() }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: "Inválido" });
    const banner = await prisma.banner.update({ where: { id }, data: body.data });
    return banner;
  });

  app.delete("/admin/banners/:id", { preHandler: roleGuard(["ADMIN"]) }, async (req) => {
    const { id } = req.params as { id: string };
    await prisma.banner.delete({ where: { id } });
    return { ok: true };
  });
}
