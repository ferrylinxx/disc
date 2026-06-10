import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Cliente Prisma (singleton) con driver adapter de PostgreSQL.
 * Patrón Prisma ORM v7: la conexión se inyecta vía adapter.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Config del adapter pg.
 * - TLS: Supabase (pooler) presenta una cadena que el `pg` reciente trata como
 *   autofirmada; se acepta sin verificar la CA (la conexion sigue cifrada).
 * - Pool: en Supabase se limita a 1 conexion por instancia (equivalente a
 *   `connection_limit=1`). Imprescindible en serverless con el transaction
 *   pooler para no agotar el pool_size del pooler (EMAXCONNSESSION). No se
 *   aplica al Postgres local.
 */
function buildPgConfig() {
  const connectionString = process.env.DATABASE_URL;
  const isSupabase =
    !!connectionString && /sslmode=|\.supabase\.com/.test(connectionString);
  if (!isSupabase) return { connectionString };
  return {
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  };
}

function createClient() {
  const adapter = new PrismaPg(buildPgConfig());
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
