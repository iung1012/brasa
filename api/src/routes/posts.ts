import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { authGuard } from "../auth.js";

export async function postRoutes(app: FastifyInstance) {
  // criar publicação (entra em moderação automática antes de aparecer)
  app.post("/posts", { preHandler: authGuard }, async (req, reply) => {
    const body = z.object({
      description: z.string().max(2200).optional(),
      mediaUrls: z.array(z.string().url()).min(1),
      visibility: z.enum(["PUBLIC", "VERIFIED_ONLY", "FOLLOWERS"]).default("PUBLIC"),
      lat: z.number().optional(),
      lng: z.number().optional(),
      ageConsent: z.literal(true), // obrigatório: maioridade dos retratados
    }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: body.error.flatten() });

    const post = await prisma.post.create({
      data: {
        authorId: req.user.sub,
        description: body.data.description,
        mediaUrls: body.data.mediaUrls,
        visibility: body.data.visibility,
        lat: body.data.lat,
        lng: body.data.lng,
        moderation: "PENDING",
        ageConsent: {
          create: { uploaderId: req.user.sub, ip: req.ip },
        },
      },
    });

    // enfileira mídia p/ classificador (CSAM/nudez) — stub
    for (const url of body.data.mediaUrls) {
      await prisma.moderationQueue.create({ data: { mediaUrl: url, postId: post.id } });
    }
    return reply.code(201).send(post);
  });

  // feed: ?tab=all (cronológico) | ?tab=reco (recomendações simples)
  app.get("/posts/feed", { preHandler: authGuard }, async (req) => {
    const { tab = "all", cursor } = req.query as { tab?: string; cursor?: string };
    const where = { moderation: "APPROVED" as const, visibility: "PUBLIC" as const };
    return prisma.post.findMany({
      where,
      take: 20,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: tab === "reco" ? { fireCount: "desc" } : { createdAt: "desc" },
      include: {
        author: { select: { username: true, displayName: true, avatarUrl: true, verification: true } },
      },
    });
  });

  // 🔥 dar/tirar fogo (toggle) — atualiza contador atomicamente
  app.post("/posts/:id/fire", { preHandler: authGuard }, async (req, reply) => {
    const postId = (req.params as any).id as string;
    const userId = req.user.sub;

    const existing = await prisma.reaction.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.reaction.delete({ where: { id: existing.id } }),
        prisma.post.update({ where: { id: postId }, data: { fireCount: { decrement: 1 } } }),
      ]);
      return { fired: false };
    }

    const [, post] = await prisma.$transaction([
      prisma.reaction.create({ data: { postId, userId, type: "FIRE" } }),
      prisma.post.update({ where: { id: postId }, data: { fireCount: { increment: 1 } } }),
    ]);

    // notifica o autor (exceto fogo no próprio post)
    if (post.authorId !== userId) {
      await prisma.notification.create({
        data: { userId: post.authorId, type: "fire", payload: { postId, fromUserId: userId } },
      });
    }
    return reply.send({ fired: true, fireCount: post.fireCount });
  });

  // comentar
  app.post("/posts/:id/comments", { preHandler: authGuard }, async (req, reply) => {
    const postId = (req.params as any).id as string;
    const body = z.object({
      body: z.string().min(1).max(1000),
      parentId: z.string().optional(),
    }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: body.error.flatten() });

    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: { postId, userId: req.user.sub, body: body.data.body, parentId: body.data.parentId },
      }),
      prisma.post.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } }),
    ]);
    return reply.code(201).send(comment);
  });

  // salvar / dessalvar
  app.post("/posts/:id/save", { preHandler: authGuard }, async (req) => {
    const postId = (req.params as any).id as string;
    const userId = req.user.sub;
    const existing = await prisma.save.findUnique({ where: { postId_userId: { postId, userId } } });
    if (existing) {
      await prisma.save.delete({ where: { id: existing.id } });
      return { saved: false };
    }
    await prisma.save.create({ data: { postId, userId } });
    return { saved: true };
  });
}
