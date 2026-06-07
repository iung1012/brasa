import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { authGuard } from "../auth.js";

// arredonda coordenada p/ grid (~anti-stalking): nunca expõe posição exata
function fuzz(value: number, gridMeters = 600): number {
  const deg = gridMeters / 111_320; // aprox. graus por metro
  return Math.round(value / deg) * deg;
}

export async function geoRoutes(app: FastifyInstance) {
  // atualiza minha localização (geom é preenchido pelo trigger SQL)
  app.put("/geo/me", { preHandler: authGuard }, async (req, reply) => {
    const body = z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      accuracy: z.enum(["EXACT", "NEIGHBORHOOD", "CITY"]).default("NEIGHBORHOOD"),
      sharing: z.boolean().default(true),
    }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: body.error.flatten() });

    const { lat, lng, accuracy, sharing } = body.data;
    await prisma.userLocation.upsert({
      where: { userId: req.user.sub },
      create: { userId: req.user.sub, lat, lng, accuracy, sharing },
      update: { lat, lng, accuracy, sharing },
    });
    return { ok: true };
  });

  // perfis a até `radius` metros, compatíveis com minhas preferências
  app.get("/geo/nearby", { preHandler: authGuard }, async (req) => {
    const q = z.object({
      lat: z.coerce.number(),
      lng: z.coerce.number(),
      radius: z.coerce.number().min(500).max(50_000).default(10_000),
      limit: z.coerce.number().min(1).max(100).default(50),
    }).parse(req.query);

    // preferências do viewer (que tipos quer ver)
    const me = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { preferredTypes: true },
    });
    const types = me?.preferredTypes ?? [];

    // PostGIS: ST_DWithin usa o índice GIST. Distância arredondada na saída.
    const rows = await prisma.$queryRaw<
      { id: string; username: string; displayName: string; avatarUrl: string | null;
        profileType: string; verification: string; dist: number }[]
    >`
      SELECT u.id, u.username, u."displayName", u."avatarUrl",
             u."profileType", u.verification::text AS verification,
             ST_Distance(l.geom, ST_MakePoint(${q.lng}, ${q.lat})::geography) AS dist
      FROM "UserLocation" l
      JOIN "User" u ON u.id = l."userId"
      WHERE l.sharing = true
        AND u."bannedAt" IS NULL
        AND u.id <> ${req.user.sub}
        AND (${types.length} = 0 OR u."profileType"::text = ANY(${types}::text[]))
        AND ST_DWithin(l.geom, ST_MakePoint(${q.lng}, ${q.lat})::geography, ${q.radius})
      ORDER BY dist ASC
      LIMIT ${q.limit};
    `;

    // distância em "blocos" de 100m p/ não revelar precisão fina
    return rows.map((r) => ({
      ...r,
      distanceKm: Math.round(r.dist / 100) / 10,
      dist: undefined,
    }));
  });

  // pins do mapa (coordenadas embaçadas no grid)
  app.get("/geo/map", { preHandler: authGuard }, async (req) => {
    const rows = await prisma.userLocation.findMany({
      where: { sharing: true, user: { bannedAt: null } },
      take: 200,
      include: { user: { select: { id: true, username: true, avatarUrl: true, verification: true } } },
    });
    return rows.map((r) => ({
      userId: r.userId,
      username: r.user.username,
      avatarUrl: r.user.avatarUrl,
      verified: r.user.verification === "APPROVED",
      lat: fuzz(r.lat),
      lng: fuzz(r.lng),
    }));
  });
}
