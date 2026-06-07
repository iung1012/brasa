import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { authGuard } from "../auth.js";

export async function reportRoutes(app: FastifyInstance) {
  // denunciar usuário / post / comentário / mensagem (+ spam)
  app.post("/reports", { preHandler: authGuard }, async (req, reply) => {
    const body = z.object({
      targetType: z.enum(["USER", "POST", "COMMENT", "MESSAGE"]),
      targetId: z.string(),
      category: z.enum([
        "MINOR", "NON_CONSENSUAL", "SPAM", "FAKE_PROFILE",
        "HARASSMENT", "ILLEGAL", "OTHER",
      ]),
      body: z.string().max(1000).optional(),
    }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: body.error.flatten() });

    const report = await prisma.report.create({
      data: { reporterId: req.user.sub, ...body.data },
    });

    // denúncia de menor = prioridade máxima (gancho p/ alerta ao time)
    if (body.data.category === "MINOR" || body.data.category === "NON_CONSENSUAL") {
      app.log.warn({ reportId: report.id, category: body.data.category }, "DENÚNCIA CRÍTICA");
    }
    return reply.code(201).send({ ok: true });
  });

  // bloquear usuário (silencioso — o bloqueado não sabe)
  app.post("/blocks/:userId", { preHandler: authGuard }, async (req) => {
    const blockedId = (req.params as any).userId as string;
    await prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: req.user.sub, blockedId } },
      create: { blockerId: req.user.sub, blockedId },
      update: {},
    });
    return { ok: true };
  });
}
