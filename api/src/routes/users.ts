import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { authGuard } from "../auth.js";

const USER_SELECT = {
  id: true, username: true, displayName: true, bio: true,
  avatarUrl: true, coverUrl: true, profileType: true,
  city: true, interests: true, verification: true,
  locationVisibility: true, createdAt: true,
  _count: { select: { posts: true, followers: true } },
} as const;

export async function userRoutes(app: FastifyInstance) {

  // ── GET /users/me ──────────────────────────────────────────────
  app.get("/users/me", { preHandler: authGuard }, async (req) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.user.sub },
      select: USER_SELECT,
    });
    return user;
  });

  // ── PATCH /users/me ────────────────────────────────────────────
  app.patch("/users/me", { preHandler: authGuard }, async (req, reply) => {
    const schema = z.object({
      displayName:        z.string().min(2).max(50).optional(),
      bio:                z.string().max(500).optional(),
      city:               z.string().max(80).optional(),
      avatarUrl:          z.string().url().optional(),
      coverUrl:           z.string().url().optional(),
      interests:          z.array(z.string()).max(10).optional(),
      locationVisibility: z.enum(["EXACT", "NEIGHBORHOOD", "CITY", "HIDDEN"]).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    const updated = await prisma.user.update({
      where: { id: req.user.sub },
      data: parsed.data,
      select: USER_SELECT,
    });
    return updated;
  });

  // ── GET /users/search ──────────────────────────────────────────
  app.get("/users/search", { preHandler: authGuard }, async (req, reply) => {
    const schema = z.object({
      q:       z.string().min(1).max(50).optional(),
      type:    z.string().optional(),          // COUPLE_MF, SINGLE_M...
      maxKm:   z.coerce.number().max(200).optional(),
      cursor:  z.string().optional(),
      take:    z.coerce.number().max(50).default(20),
    });
    const q = schema.safeParse(req.query);
    if (!q.success) return reply.code(400).send({ error: q.error.flatten() });
    const { q: term, type, take, cursor } = q.data;

    const where: Record<string, unknown> = { bannedAt: null, id: { not: req.user.sub } };
    if (term) {
      where.OR = [
        { username:    { contains: term, mode: "insensitive" } },
        { displayName: { contains: term, mode: "insensitive" } },
      ];
    }
    if (type) where.profileType = type;

    const users = await prisma.user.findMany({
      where,
      select: USER_SELECT,
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
    });
    return users;
  });

  // ── GET /users/:username ───────────────────────────────────────
  app.get("/users/:username", { preHandler: authGuard }, async (req, reply) => {
    const { username } = req.params as { username: string };
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: USER_SELECT,
    });
    if (!user) return reply.code(404).send({ error: "Usuário não encontrado" });
    return user;
  });
}
