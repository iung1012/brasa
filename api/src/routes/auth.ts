import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma.js";

const usernameRe = /^[a-z0-9_.]{3,30}$/;

const registerSchema = z.object({
  username: z.string().regex(usernameRe, "@ inválido (a-z, 0-9, _ .)"),
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
  birthDate: z.coerce.date(),
  profileType: z.enum([
    "COUPLE_MF", "COUPLE_MM", "COUPLE_FF", "SINGLE_M", "SINGLE_F", "VENUE",
  ]),
});

function isAdult(birth: Date): boolean {
  const age = (Date.now() - birth.getTime()) / (365.25 * 24 * 3600 * 1000);
  return age >= 18;
}

export async function authRoutes(app: FastifyInstance) {
  // checagem de disponibilidade do @ (validação em tempo real no front)
  app.get("/auth/username-available", async (req) => {
    const u = (req.query as any).username?.toLowerCase();
    if (!u || !usernameRe.test(u)) return { available: false, reason: "inválido" };
    const exists = await prisma.user.findUnique({ where: { username: u } });
    return { available: !exists };
  });

  app.post("/auth/register", async (req, reply) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const data = parsed.data;

    if (!isAdult(data.birthDate)) {
      return reply.code(403).send({ error: "É necessário ser maior de 18 anos." });
    }

    const username = data.username.toLowerCase();
    const dup = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: data.email }] },
    });
    if (dup) return reply.code(409).send({ error: "@ ou e-mail já em uso." });

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        username,
        email: data.email,
        passwordHash,
        displayName: data.displayName,
        birthDate: data.birthDate,
        profileType: data.profileType,
      },
      select: { id: true, username: true, role: true, displayName: true },
    });

    const token = app.jwt.sign({ sub: user.id, role: user.role });
    return reply.code(201).send({ token, user });
  });

  app.post("/auth/login", async (req, reply) => {
    const body = z.object({
      identifier: z.string(), // @ ou email
      password: z.string(),
    }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: "Dados inválidos" });

    const id = body.data.identifier.toLowerCase();
    const user = await prisma.user.findFirst({
      where: { OR: [{ username: id }, { email: id }] },
    });
    if (!user || !(await bcrypt.compare(body.data.password, user.passwordHash))) {
      return reply.code(401).send({ error: "Credenciais inválidas" });
    }
    if (user.bannedAt) return reply.code(403).send({ error: "Conta banida" });

    const token = app.jwt.sign({ sub: user.id, role: user.role });
    return {
      token,
      user: { id: user.id, username: user.username, role: user.role, displayName: user.displayName },
    };
  });
}
