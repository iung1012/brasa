import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { authGuard } from "../auth.js";

export async function interestRoutes(app: FastifyInstance) {
  // enviar interesse (ou super-interesse) para alguém
  app.post("/interests", { preHandler: authGuard }, async (req, reply) => {
    const body = z.object({
      toUserId: z.string(),
      isSuper: z.boolean().default(false),
    }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: body.error.flatten() });
    if (body.data.toUserId === req.user.sub)
      return reply.code(400).send({ error: "Não dá pra enviar interesse a si mesmo" });

    const interest = await prisma.interest.upsert({
      where: { fromUserId_toUserId: { fromUserId: req.user.sub, toUserId: body.data.toUserId } },
      create: { fromUserId: req.user.sub, toUserId: body.data.toUserId, isSuper: body.data.isSuper },
      update: { isSuper: body.data.isSuper },
    });

    await prisma.notification.create({
      data: {
        userId: body.data.toUserId,
        type: "interest",
        payload: { fromUserId: req.user.sub, isSuper: body.data.isSuper },
      },
    });
    return reply.code(201).send(interest);
  });

  // aceitar interesse → libera o Super Chat
  app.post("/interests/:id/accept", { preHandler: authGuard }, async (req, reply) => {
    const id = (req.params as any).id as string;
    const interest = await prisma.interest.findUnique({ where: { id } });
    if (!interest || interest.toUserId !== req.user.sub)
      return reply.code(404).send({ error: "Interesse não encontrado" });

    await prisma.interest.update({ where: { id }, data: { status: "ACCEPTED" } });

    // ordena os ids para respeitar o @@unique do Chat
    const [a, b] = [interest.fromUserId, interest.toUserId].sort();
    const chat = await prisma.chat.upsert({
      where: { userAId_userBId: { userAId: a, userBId: b } },
      create: { userAId: a, userBId: b, isSuperChat: true },
      update: { isSuperChat: true },
    });

    await prisma.notification.create({
      data: { userId: interest.fromUserId, type: "match", payload: { chatId: chat.id } },
    });
    return { chatId: chat.id };
  });

  app.post("/interests/:id/ignore", { preHandler: authGuard }, async (req, reply) => {
    const id = (req.params as any).id as string;
    const interest = await prisma.interest.findUnique({ where: { id } });
    if (!interest || interest.toUserId !== req.user.sub)
      return reply.code(404).send({ error: "Interesse não encontrado" });
    await prisma.interest.update({ where: { id }, data: { status: "IGNORED" } });
    return { ok: true };
  });

  // interesses pendentes que recebi
  app.get("/interests/pending", { preHandler: authGuard }, async (req) => {
    return prisma.interest.findMany({
      where: { toUserId: req.user.sub, status: "PENDING" },
      include: {
        fromUser: { select: { id: true, username: true, displayName: true, avatarUrl: true, verification: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  });
}
