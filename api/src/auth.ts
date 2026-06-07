import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

// payload do JWT
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; role: string };
    user: { sub: string; role: string };
  }
}

// middleware: exige usuário autenticado
export async function authGuard(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch {
    return reply.code(401).send({ error: "Não autenticado" });
  }
}

// middleware: exige admin/moderador
export function roleGuard(roles: string[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await req.jwtVerify();
    } catch {
      return reply.code(401).send({ error: "Não autenticado" });
    }
    if (!roles.includes(req.user.role)) {
      return reply.code(403).send({ error: "Sem permissão" });
    }
  };
}

export type { FastifyInstance };
