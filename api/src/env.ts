function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Variável de ambiente faltando: ${name}`);
  return v;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  redisUrl: required("REDIS_URL", "redis://localhost:6379"),
  port: Number(required("PORT", "3333")),
  jwtSecret: required("JWT_SECRET", "dev-secret-change-me"),
  jwtExpiresIn: required("JWT_EXPIRES_IN", "7d"),
  corsOrigin: required("CORS_ORIGIN", "http://localhost:5173"),
};
