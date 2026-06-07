# 🔥 Brasa

Rede social adulta (estilo Instagram + descoberta por mapa) para maiores de idade.
Monorepo com **front e back separados**, self-host via Docker.

```
brasa/
├── docker-compose.yml   # Postgres+PostGIS, Redis
├── api/                 # Backend: Fastify + Prisma + Socket.io (TypeScript)
└── web/                 # Frontend: Vite + React + Tailwind (temas claro/escuro)
```

## Stack

| Camada            | Tecnologia                                  |
| ----------------- | ------------------------------------------- |
| Frontend          | Vite + React 18 + Tailwind + React Router   |
| Backend           | Fastify + TypeScript                         |
| ORM               | Prisma 6                                     |
| Banco             | PostgreSQL 16 + **PostGIS 3.4**             |
| Realtime (chat)   | Socket.io                                    |
| Cache/fila        | Redis + BullMQ                              |
| Mapa              | MapLibre GL (estilo custom, anti-Google)    |

## Subir o ambiente

```bash
# 1. Infra (banco + redis)
docker compose up -d

# 2. API
cd api
cp ../.env.example .env
npm install
npx prisma migrate dev --name init      # cria as tabelas
npm run dev                              # http://localhost:3333

# 3. Front (outro terminal)
cd web
npm install
npm run dev                              # http://localhost:5173
```

## ⚠️ Notas importantes

- **PostGIS + Prisma:** o Prisma não modela tipos geográficos. A coluna `geom`
  é `Unsupported("geography(Point,4326)")` e as buscas por proximidade usam
  `prisma.$queryRaw` com `ST_DWithin` (ver `api/src/routes/geo.ts`).
  O índice GIST é criado por migration SQL manual (ver `api/prisma/sql/`).
- **Hospedagem:** não usar Vercel/Netlify (ToS proíbem adulto). Rodar tudo no VPS.
- **Compliance:** documentos de verificação devem ficar em bucket privado
  criptografado, NUNCA no mesmo storage das fotos públicas.
